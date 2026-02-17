import { Connection, PublicKey } from "@solana/web3.js";
import { 
  SolanaAgentSDK, 
  ParsedTransaction, 
  assessPortfolioRisk,
  PortfolioRiskAssessment 
} from "@solana-agent-sdk/core";
import { PortfolioReport, TokenHolding, PortfolioState } from "./types";
import { PortfolioCalculator } from "./portfolio";
import { AlertGenerator } from "./alerts";

export class PortfolioTrackerAgent {
  private sdk: SolanaAgentSDK;
  private mockMode: boolean = false;

  constructor(rpcUrl: string = "https://api.mainnet-beta.solana.com") {
    this.sdk = new SolanaAgentSDK({ rpcUrl });
    // Check if URL is mock
    if (rpcUrl.includes("mock") || rpcUrl === "") {
      this.mockMode = true;
      console.log("[PortfolioTrackerAgent] Operating in MOCK mode");
    }
  }

  /**
   * Main entry point: Performs full analysis of a wallet
   */
  async analyzeAndReport(walletAddress: string): Promise<PortfolioReport> {
    console.log(`[PortfolioTrackerAgent] Beginning analysis for ${walletAddress}...`);
    
    // 1. Fetch transactions
    let transactions: ParsedTransaction[] = [];
    if (this.mockMode) {
      transactions = this.generateMockTransactions(walletAddress);
      console.log(`[PortfolioTrackerAgent] Generated ${transactions.length} mock transactions for analysis.`);
    } else {
      console.log(`[PortfolioTrackerAgent] Fetching last 50 transactions from blockchain...`);
      transactions = await this.sdk.fetcher.fetchAllTransactions(walletAddress, 50);
    }

    // 2. Build current state
    console.log(`[PortfolioTrackerAgent] Reconstructing portfolio state...`);
    const state = PortfolioCalculator.buildStateFromTransactions(walletAddress, transactions);
    
    // 3. Calculate P&L and metrics
    console.log(`[PortfolioTrackerAgent] Calculating P&L metrics...`);
    const mockPrices = this.mockMode ? {
      "SOL": 145.20,
      "JUPyiwrYJFskR4S0000000000000000000000000000": 1.12,
      "DezXAZ8z7Pnrn9shqH4G7M8C2n2pC8D1z5L6w1S9S9": 0.00002,
      "DEFAULT": 0.5
    } : { "SOL": 1.0 }; // Should fetch real prices in production

    const holdings = PortfolioCalculator.calculateHoldings(state, transactions, mockPrices);

    // 4. Risk Assessment
    console.log(`[PortfolioTrackerAgent] Assessing portfolio risks...`);
    let riskAssessment: PortfolioRiskAssessment;
    
    if (this.mockMode) {
      riskAssessment = this.generateMockRiskAssessment(holdings);
    } else {
      riskAssessment = await assessPortfolioRisk(this.sdk.connection, state.balances);
    }

    // Attach rug risk scores to holdings
    for (const holding of holdings) {
      const risk = riskAssessment.tokenRisks.get(holding.mint);
      holding.rugRiskScore = risk ? risk.score / 100 : 0;
    }

    // 5. Generate Alerts
    console.log(`[PortfolioTrackerAgent] Generating alerts and recommendations...`);
    const alerts = AlertGenerator.generateAlerts(holdings, riskAssessment);
    const recommendedActions = AlertGenerator.generateRecommendations(alerts);

    console.log(`[PortfolioTrackerAgent] Analysis complete. Detected ${alerts.length} alerts.`);

    return {
      wallet: walletAddress,
      timestamp: Date.now(),
      holdings,
      riskAssessment,
      alerts,
      recentActivity: transactions.slice(0, 10), // Return top 10 for report
      recommendedActions
    };
  }

  private generateMockTransactions(wallet: string): ParsedTransaction[] {
    // Generate some mock history
    return [
      {
        signature: "mock_sig_1",
        blockTime: Date.now() / 1000 - 3600,
        slot: 12345678,
        success: true,
        fee: 5000,
        instructions: [],
        balanceChanges: [
          { address: wallet, token: null, tokenSymbol: "SOL", before: 10, after: 9.5, change: -0.5 },
          { address: wallet, token: "JUPyiwrYJFskR4S0000000000000000000000000000", tokenSymbol: "JUP", before: 0, after: 100, change: 100 }
        ],
        summary: "Swapped 0.5 SOL for 100 JUP"
      },
      {
        signature: "mock_sig_2",
        blockTime: Date.now() / 1000 - 1800,
        slot: 12345680,
        success: true,
        fee: 5000,
        instructions: [],
        balanceChanges: [
          { address: wallet, token: "DezXAZ8z7Pnrn9shqH4G7M8C2n2pC8D1z5L6w1S9S9", tokenSymbol: "BONK", before: 0, after: 1000000, change: 1000000 },
          { address: wallet, token: null, tokenSymbol: "SOL", before: 9.5, after: 9.4, change: -0.1 }
        ],
        summary: "Received 1,000,000 BONK"
      }
    ];
  }

  private generateMockRiskAssessment(holdings: TokenHolding[]): PortfolioRiskAssessment {
    const tokenRisks = new Map();
    holdings.forEach(h => {
      tokenRisks.set(h.mint, {
        score: h.mint.includes("Dez") ? 85 : 10, // High risk for BONK in mock
        level: h.mint.includes("Dez") ? 'high' : 'low',
        flags: h.mint.includes("Dez") ? ['High volatility', 'Suspicious creator'] : []
      });
    });

    return {
      overallRiskScore: 45,
      concentrationScore: 30,
      tokenRisks,
      topHoldingsConcentration: 65,
      stabilityScore: 0.6,
      details: ["Mock stability analysis complete"]
    };
  }
}
