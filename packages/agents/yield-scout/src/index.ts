/**
 * YieldScoutAgent — Reference Agent for Solana Agent SDK
 * 
 * Autonomously monitors Solana DeFi yields across protocols (Marinade, Orca,
 * Raydium, marginfi, Kamino), identifies optimal opportunities, and recommends
 * or executes rebalancing strategies.
 * 
 * Demonstrates:
 * - Multi-protocol data aggregation
 * - Risk-adjusted opportunity ranking
 * - Agent reasoning + decision logging
 * - Autonomous monitoring loops
 * - Integration with core SDK executor for swap execution
 */

import { SolanaAgentSDK } from "@solana-agent-sdk/core";
import { YieldScanner } from "./scanner";
import { YieldRecommender } from "./recommender";
import {
  YieldScoutConfig,
  YieldScoutReport,
  YieldOpportunity,
  WalletYieldPosition,
} from "./types";

export { YieldScoutConfig, YieldScoutReport, YieldOpportunity, WalletYieldPosition };
export * from "./types";

export class YieldScoutAgent {
  private sdk: SolanaAgentSDK;
  private scanner: YieldScanner;
  private recommender: YieldRecommender;
  private config: YieldScoutConfig;

  constructor(config: YieldScoutConfig = {}) {
    this.config = {
      rpcUrl: config.rpcUrl ?? "https://api.mainnet-beta.solana.com",
      mockMode: config.mockMode ?? false,
      minApy: config.minApy ?? 5,
      maxRiskScore: config.maxRiskScore ?? 60,
      minTvl: config.minTvl ?? 100_000,
      protocols: config.protocols,
    };

    // Auto-detect mock mode
    const rpc = this.config.rpcUrl ?? "";
    if (rpc.includes("mock") || rpc === "" || this.config.mockMode) {
      this.config.mockMode = true;
      console.log("[YieldScoutAgent] Operating in MOCK mode — using simulated market data");
    }

    this.sdk = new SolanaAgentSDK({ rpcUrl: this.config.rpcUrl ?? "" });
    this.scanner = new YieldScanner(this.config);
    this.recommender = new YieldRecommender();
  }

  /**
   * Full yield scout analysis for a wallet.
   * 
   * Steps:
   * 1. Scan all configured protocols for yield opportunities
   * 2. Detect current wallet yield positions (from transaction history)
   * 3. Rank opportunities by risk-adjusted APY
   * 4. Generate actionable recommendations
   */
  async scout(walletAddress: string): Promise<YieldScoutReport> {
    console.log(`\n[YieldScoutAgent] === Starting Yield Scout for ${walletAddress} ===`);
    const startTime = Date.now();

    // Step 1: Scan protocols
    console.log("[YieldScoutAgent] Step 1: Scanning DeFi protocols for yield opportunities...");
    const opportunities = await this.scanner.scanAllProtocols();

    // Step 2: Detect wallet positions
    console.log("[YieldScoutAgent] Step 2: Detecting current wallet yield positions...");
    const positions = await this.detectWalletPositions(walletAddress);

    // Step 3: Generate recommendations
    console.log("[YieldScoutAgent] Step 3: Generating recommendations via decision engine...");
    const recommendations = this.recommender.generateRecommendations(opportunities, positions);

    // Step 4: Build summary
    const summary = this.recommender.buildSummary(opportunities, positions);

    // Attach better alternatives to each position
    for (const pos of positions) {
      pos.betterOpportunities = opportunities.filter(opp => {
        return opp.totalApy > pos.currentApy + 3 && opp.riskScore <= this.config.maxRiskScore!;
      });
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[YieldScoutAgent] === Scout complete in ${elapsed}s ===`);
    console.log(`[YieldScoutAgent] Found ${opportunities.length} opportunities, ${recommendations.length} recommendations`);
    console.log(`[YieldScoutAgent] Best APY: ${summary.bestApy.toFixed(1)}% at ${summary.bestPool} (${summary.bestProtocol})`);

    return {
      wallet: walletAddress,
      timestamp: new Date(),
      topOpportunities: opportunities.slice(0, 5),
      totalOpportunitiesScanned: opportunities.length,
      currentPositions: positions,
      summary,
      recommendations,
      agentDecisions: this.recommender.getDecisionLog(),
    };
  }

  /**
   * Detect current yield positions from wallet transaction history.
   * In production: reads DeFi protocol positions on-chain.
   * In mock: returns representative example positions.
   */
  private async detectWalletPositions(wallet: string): Promise<WalletYieldPosition[]> {
    if (this.config.mockMode) {
      console.log("[YieldScoutAgent] Generating mock wallet positions...");
      return [
        {
          protocol: "marinade",
          poolName: "mSOL Native Staking",
          poolAddress: "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
          entryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          depositedValueUsd: 5000,
          currentValueUsd: 5033.2,
          yieldEarnedUsd: 33.2,
          yieldEarnedPercent: 0.664,
          currentApy: 7.8,
          betterOpportunities: [],
        },
        {
          protocol: "marginfi",
          poolName: "USDC Lending",
          poolAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          entryDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          depositedValueUsd: 2000,
          currentValueUsd: 2007.1,
          yieldEarnedUsd: 7.1,
          yieldEarnedPercent: 0.355,
          currentApy: 6.2,
          betterOpportunities: [],
        },
      ];
    }

    // Production: fetch on-chain positions
    try {
      const transactions = await this.sdk.fetcher.fetchAllTransactions(wallet, 100);
      // Analyze transactions to reconstruct DeFi positions
      // (simplified — real implementation would parse each protocol's position accounts)
      console.log(`[YieldScoutAgent] Fetched ${transactions.length} transactions for position analysis`);
      return []; // Real parsing would yield actual positions
    } catch (err) {
      console.log("[YieldScoutAgent] Could not fetch transactions — proceeding with empty positions");
      return [];
    }
  }

  /**
   * Print a human-readable report to console.
   */
  printReport(report: YieldScoutReport): void {
    const { summary, topOpportunities, recommendations, currentPositions } = report;
    const divider = "─".repeat(60);

    console.log(`\n${divider}`);
    console.log("🔭 YIELD SCOUT REPORT");
    console.log(`   Wallet: ${report.wallet}`);
    console.log(`   Time:   ${report.timestamp.toISOString()}`);
    console.log(divider);

    console.log("\n📊 MARKET SUMMARY");
    console.log(`   Best APY:        ${summary.bestApy.toFixed(1)}% (${summary.bestPool})`);
    console.log(`   Avg Market APY:  ${summary.averageMarketApy.toFixed(1)}%`);
    console.log(`   Your Current APY: ${summary.walletCurrentApy.toFixed(1)}%`);
    if (summary.potentialGainUsd > 0) {
      console.log(`   30-day Potential: +$${summary.potentialGainUsd.toFixed(2)} if rebalanced`);
    }

    console.log("\n🏆 TOP OPPORTUNITIES (Risk-Adjusted)");
    topOpportunities.slice(0, 5).forEach((opp, i) => {
      const risk = opp.riskScore <= 20 ? "🟢 LOW" : opp.riskScore <= 40 ? "🟡 MED" : "🔴 HIGH";
      console.log(`   ${i + 1}. [${risk}] ${opp.poolName} (${opp.protocol.toUpperCase()})`);
      console.log(`      APY: ${opp.totalApy.toFixed(1)}% | TVL: $${(opp.tvl / 1e6).toFixed(0)}M | Risk: ${opp.riskScore}/100`);
    });

    if (currentPositions.length > 0) {
      console.log("\n💼 YOUR POSITIONS");
      currentPositions.forEach(pos => {
        const pnlSign = pos.yieldEarnedUsd >= 0 ? "+" : "";
        console.log(`   • ${pos.poolName} (${pos.protocol}) — ${pos.currentApy.toFixed(1)}% APY`);
        console.log(`     Value: $${pos.currentValueUsd.toFixed(0)} | Yield: ${pnlSign}$${pos.yieldEarnedUsd.toFixed(2)}`);
      });
    }

    console.log("\n💡 RECOMMENDATIONS");
    recommendations.forEach((rec, i) => {
      const icon = rec.priority === "urgent" ? "🚨" : rec.priority === "high" ? "⚡" : rec.priority === "medium" ? "💡" : "👀";
      const action = rec.type.toUpperCase();
      console.log(`   ${icon} [${action}] ${rec.toPool ?? rec.fromPool ?? "Position"}`);
      console.log(`      ${rec.reasoning}`);
      if (rec.apyImprovement) {
        console.log(`      APY improvement: +${rec.apyImprovement.toFixed(1)}pp`);
      }
      if (rec.estimatedGainUsd) {
        console.log(`      Est. 30d gain: +$${rec.estimatedGainUsd.toFixed(2)}`);
      }
      console.log(`      Auto-executable: ${rec.autoExecutable ? "Yes ✅" : "Requires confirmation"}`);
    });

    console.log(`\n${divider}\n`);
  }
}

/**
 * YieldMonitor — Runs YieldScoutAgent on a schedule.
 * Reports alerts when APY changes significantly or better opportunities emerge.
 */
export class YieldMonitor {
  private agent: YieldScoutAgent;
  private intervalMs: number;
  private lastReport: YieldScoutReport | null = null;

  constructor(config: YieldScoutConfig = {}, intervalMs: number = 60 * 60 * 1000) {
    this.agent = new YieldScoutAgent(config);
    this.intervalMs = intervalMs;
  }

  async start(walletAddress: string, onReport: (report: YieldScoutReport) => void): Promise<void> {
    console.log(`[YieldMonitor] Starting continuous monitoring for ${walletAddress}`);
    console.log(`[YieldMonitor] Scan interval: ${this.intervalMs / 60000} minutes`);

    const runScan = async () => {
      const report = await this.agent.scout(walletAddress);
      
      // Detect significant changes vs last report
      if (this.lastReport) {
        const apyChange = Math.abs(report.summary.bestApy - this.lastReport.summary.bestApy);
        if (apyChange >= 2) {
          console.log(`[YieldMonitor] ⚡ Significant APY change detected: ${apyChange.toFixed(1)}pp shift`);
        }
        const urgentRecs = report.recommendations.filter(r => r.priority === "urgent");
        if (urgentRecs.length > 0) {
          console.log(`[YieldMonitor] 🚨 ${urgentRecs.length} urgent recommendations generated`);
        }
      }
      
      this.lastReport = report;
      onReport(report);
    };

    await runScan();
    setInterval(runScan, this.intervalMs);
  }
}
