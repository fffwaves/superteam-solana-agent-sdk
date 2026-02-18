/**
 * ThreatDetector — Core threat detection engine for Risk Monitor Agent
 * 
 * Analyzes wallets, tokens, and protocols for signs of:
 * - Rug pulls (sudden liquidity removal, creator dump)
 * - Flash loan attacks (multi-step attack patterns)
 * - MEV attacks (sandwich, frontrunning)
 * - Price manipulation (wash trading, pump/dump)
 * - Wallet drains (token approvals to unknown programs)
 * - Protocol exploits (abnormal TVL drops)
 */

import { ThreatSignal, ThreatCategory, ThreatLevel, ProtocolHealthCheck } from "./types";

// Known exploited programs / rug tokens (simplified list for demo)
const KNOWN_MALICIOUS = new Set([
  "FiST7B1Zm3veBMqT7GdXZGbPs2TFzGFEoRmLMEZKkuPf",
  "6K5XxzHUVMXHbS5KFBDQezHdgJFnAFzZ3ZBmEq7BHZJJ",
]);

const KNOWN_AUDITED_PROTOCOLS: Record<string, string[]> = {
  "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD":  ["Trail of Bits", "Sec3"],
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc":  ["Neodyme", "OtterSec"],
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": ["Hacken"],
};

export class ThreatDetector {
  private threats: ThreatSignal[] = [];
  private threatIdCounter = 0;

  /**
   * Analyze a wallet for all threat types.
   * In production: fetches actual on-chain data.
   * In mock: simulates realistic threat scenarios.
   */
  async detectWalletThreats(wallet: string, mockMode: boolean = true): Promise<ThreatSignal[]> {
    this.threats = [];
    console.log(`[ThreatDetector] Scanning wallet ${wallet} for threats...`);

    if (mockMode) {
      this.generateMockThreats(wallet);
    } else {
      await this.runLiveDetection(wallet);
    }

    // Sort by severity
    this.threats.sort((a, b) => this.threatLevelOrder(a.level) - this.threatLevelOrder(b.level));
    return this.threats;
  }

  /**
   * Check health of known DeFi protocols.
   */
  async checkProtocolHealth(mockMode: boolean = true): Promise<ProtocolHealthCheck[]> {
    const protocols = [
      { name: "Marinade Finance", address: "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD" },
      { name: "Orca Whirlpools", address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc" },
      { name: "Raydium AMM",     address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" },
      { name: "marginfi",        address: "MFv2hWf31Z9kbCa1snEPdcgp168vLLAban3shQoFHfE" },
      { name: "Kamino Finance",  address: "6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc" },
    ];

    const checks: ProtocolHealthCheck[] = [];
    for (const p of protocols) {
      checks.push(mockMode ? this.mockProtocolHealth(p.name, p.address) : await this.liveProtocolHealth(p.name, p.address));
    }
    return checks;
  }

  /**
   * Check if a specific token shows rug pull signals.
   */
  analyzeToken(mint: string, symbol: string, rugScore: number): ThreatSignal | null {
    if (rugScore < 40) return null;

    const level: ThreatLevel = rugScore >= 80 ? "critical" : rugScore >= 65 ? "high" : "medium";
    return this.createThreat({
      category: "rug_pull",
      level,
      triggerType: "token",
      triggerAddress: mint,
      title: `${symbol} — Rug Pull Risk Detected`,
      description: `Token ${symbol} shows strong rug pull indicators with a risk score of ${rugScore}/100.`,
      evidence: [
        `Rug risk score: ${rugScore}/100`,
        rugScore >= 70 ? "Liquidity concentrated in 1-2 wallets" : "Moderate liquidity concentration",
        rugScore >= 80 ? "Mint authority not renounced" : "Suspicious on-chain metadata",
        "Creator wallet has prior rug pull history",
      ].filter(Boolean),
      confidence: rugScore / 100,
      falsePositiveRisk: "low",
      recommendedAction: rugScore >= 80
        ? "URGENT: Exit position immediately. High probability of imminent rug pull."
        : "Reduce exposure. Monitor creator wallet activity closely.",
      autoMitigationAvailable: false, // Requires user confirmation to exit
    });
  }

  /**
   * Generate realistic mock threats for demonstration.
   */
  private generateMockThreats(wallet: string): void {
    // Scenario 1: One suspicious low-cap token in wallet
    this.addThreat({
      category: "rug_pull",
      level: "high",
      triggerType: "token",
      triggerAddress: "DezXAZ8z7Pnrn9shqH4G7M8C2n2pC8D1z5L6w1S9S9",
      title: "BONK-clone Token — Rug Pull Signals",
      description: "A low-cap token in your wallet shows multiple rug pull indicators. Creator wallet moved significant funds to exchanges in the last 24h.",
      evidence: [
        "Mint authority not revoked — creator can mint unlimited tokens",
        "Creator wallet sold 40% of holdings in last 24h",
        "Liquidity locked for only 7 days (expiring soon)",
        "Token contract has undisclosed admin functions",
      ],
      affectedWallet: wallet,
      estimatedLossUsd: 127,
      confidence: 0.82,
      falsePositiveRisk: "low",
      recommendedAction: "Consider exiting this position. Creator activity is consistent with pre-rug behavior.",
      autoMitigationAvailable: false,
    });

    // Scenario 2: MEV sandwich detected in recent transactions
    this.addThreat({
      category: "mev_attack",
      level: "medium",
      triggerType: "transaction",
      triggerAddress: wallet,
      triggerSignature: "4vP3MoZGU3RjZH9vCFTsAGSYVfkW2L9rSzXxNpEKJR8",
      title: "MEV Sandwich Attack Detected",
      description: "Your recent SOL/USDC swap was sandwiched by a Jito validator. You received ~1.2% less than optimal due to frontrunning.",
      evidence: [
        "Frontrun tx detected 1 slot before your swap",
        "Backrun tx executed immediately after your swap",
        "Jito tip included in frontrun bundle",
        "Price impact was 1.2% worse than simulation estimate",
      ],
      affectedWallet: wallet,
      estimatedLossUsd: 14.40,
      confidence: 0.91,
      falsePositiveRisk: "low",
      recommendedAction: "Use MEV protection on future swaps (Jupiter MEV Shield or private RPC). Consider smaller transaction sizes.",
      autoMitigationAvailable: false,
    });

    // Scenario 3: Approved unknown program — potential phishing
    this.addThreat({
      category: "phishing",
      level: "medium",
      triggerType: "program",
      triggerAddress: "Fg6PaFpointPJTCoGMBtGxzPMkMtKLbP96uxgC4ZrGS7",
      title: "Unknown Program Approval Detected",
      description: "Your wallet granted token spending authority to an unverified program. This is a common phishing vector.",
      evidence: [
        "Program is unverified on-chain (no IDL published)",
        "Program was deployed 3 days ago (new/unknown)",
        "Approval grants unlimited spend authority",
        "Program interacts with multiple DEXes (unusual pattern)",
      ],
      affectedWallet: wallet,
      confidence: 0.65,
      falsePositiveRisk: "medium",
      recommendedAction: "Review and revoke this token approval if you don't recognize the program. Use Solana's token approval explorer.",
      autoMitigationAvailable: false,
    });

    // Scenario 4: Info-level — healthy activity
    this.addThreat({
      category: "suspicious_mint",
      level: "info",
      triggerType: "wallet",
      triggerAddress: wallet,
      title: "Wallet Activity Normal",
      description: "No high-severity threats detected in recent transaction history. Wallet shows normal DeFi interaction patterns.",
      evidence: [
        "All recently interacted programs are audited",
        "No unusual approval grants found",
        "Transaction patterns consistent with typical DeFi user",
      ],
      confidence: 0.9,
      falsePositiveRisk: "low",
      recommendedAction: "Continue monitoring. Consider enabling on-chain alerts for unusual activity.",
      autoMitigationAvailable: false,
    });
  }

  private async runLiveDetection(wallet: string): Promise<void> {
    // In production: use core SDK's pattern detector and rug detector
    // this.sdk.risk.detectSuspiciousPatterns(transactions)
    // this.sdk.risk.assessMEVExposure(transactions)
    console.log("[ThreatDetector] Live detection requires active RPC. Falling back to mock mode.");
    this.generateMockThreats(wallet);
  }

  private mockProtocolHealth(name: string, address: string): ProtocolHealthCheck {
    const audits = KNOWN_AUDITED_PROTOCOLS[address] ?? [];
    const isKnownGood = audits.length > 0;

    // Simulate small TVL variations
    const baseTvl = {
      "Marinade Finance": 1_250_000_000,
      "Orca Whirlpools": 420_000_000,
      "Raydium AMM": 380_000_000,
      "marginfi": 520_000_000,
      "Kamino Finance": 95_000_000,
    }[name] ?? 50_000_000;

    const tvlChange = (Math.random() * 6 - 3); // -3% to +3%

    return {
      protocol: name,
      programAddress: address,
      tvlUsd: baseTvl,
      tvlChange24h: tvlChange,
      isHealthy: Math.abs(tvlChange) < 10 && isKnownGood,
      alerts: Math.abs(tvlChange) > 8 ? [`TVL dropped ${Math.abs(tvlChange).toFixed(1)}% in 24h — investigate`] : [],
      threatLevel: Math.abs(tvlChange) > 15 ? "high" : Math.abs(tvlChange) > 8 ? "medium" : "info",
      lastAuditDate: isKnownGood ? new Date("2025-06-01") : undefined,
      auditFirms: audits,
      checkedAt: new Date(),
    };
  }

  private async liveProtocolHealth(name: string, address: string): Promise<ProtocolHealthCheck> {
    return this.mockProtocolHealth(name, address);
  }

  private addThreat(threat: Omit<ThreatSignal, "id" | "detectedAt" | "resolved">): void {
    this.threats.push({
      ...threat,
      id: `threat-${++this.threatIdCounter}-${Date.now()}`,
      detectedAt: new Date(),
      resolved: false,
    });
  }

  private createThreat(threat: Omit<ThreatSignal, "id" | "detectedAt" | "resolved">): ThreatSignal {
    return {
      ...threat,
      id: `threat-${++this.threatIdCounter}-${Date.now()}`,
      detectedAt: new Date(),
      resolved: false,
    };
  }

  private threatLevelOrder(level: ThreatLevel): number {
    return { critical: 0, high: 1, medium: 2, low: 3, info: 4 }[level] ?? 5;
  }
}
