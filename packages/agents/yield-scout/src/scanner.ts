/**
 * YieldScanner — Protocol APY Scanner
 * 
 * Scans multiple Solana DeFi protocols for yield opportunities.
 * In production: fetches live APY data from protocol APIs.
 * In mock mode: generates realistic data for demonstration.
 */

import { YieldOpportunity, YieldProtocol, YieldType, RiskLevel, YieldScoutConfig } from "./types";

// Well-known Solana pool addresses (mainnet)
const KNOWN_POOLS: Record<string, { protocol: YieldProtocol; poolName: string; tokens: string[]; yieldType: YieldType }> = {
  "marinade-native": { protocol: "marinade", poolName: "mSOL Native Staking", tokens: ["SOL", "mSOL"], yieldType: "staking" },
  "marinade-liquid": { protocol: "marinade", poolName: "mSOL Liquid Staking", tokens: ["SOL", "mSOL"], yieldType: "staking" },
  "orca-sol-usdc": { protocol: "orca", poolName: "SOL/USDC Whirlpool", tokens: ["SOL", "USDC"], yieldType: "liquidity_pool" },
  "orca-sol-usdt": { protocol: "orca", poolName: "SOL/USDT Whirlpool", tokens: ["SOL", "USDT"], yieldType: "liquidity_pool" },
  "orca-jup-usdc": { protocol: "orca", poolName: "JUP/USDC Whirlpool", tokens: ["JUP", "USDC"], yieldType: "liquidity_pool" },
  "raydium-sol-usdc": { protocol: "raydium", poolName: "SOL-USDC CLMM", tokens: ["SOL", "USDC"], yieldType: "liquidity_pool" },
  "raydium-ray-sol": { protocol: "raydium", poolName: "RAY-SOL Farm", tokens: ["RAY", "SOL"], yieldType: "farming" },
  "marginfi-usdc": { protocol: "marginfi", poolName: "USDC Lending", tokens: ["USDC"], yieldType: "lending" },
  "marginfi-sol": { protocol: "marginfi", poolName: "SOL Lending", tokens: ["SOL"], yieldType: "lending" },
  "kamino-usdc-sol": { protocol: "kamino", poolName: "USDC-SOL Vault", tokens: ["USDC", "SOL"], yieldType: "vaults" },
  "drift-sol": { protocol: "drift", poolName: "SOL Spot Market", tokens: ["SOL"], yieldType: "lending" },
};

// Risk profile by protocol (base scores)
const PROTOCOL_RISK: Record<YieldProtocol, { base: number; factors: string[] }> = {
  marinade:  { base: 10, factors: ["Largest Solana liquid staking protocol", "Audited by multiple firms"] },
  orca:      { base: 20, factors: ["Concentrated liquidity (impermanent loss risk)", "Top-tier audited DEX"] },
  raydium:   { base: 30, factors: ["AMM + CLMM pools", "Smart contract risk", "Impermanent loss"] },
  kamino:    { base: 35, factors: ["Automated vault strategy", "Compound smart contract risk"] },
  marginfi:  { base: 25, factors: ["Liquidation risk if collateral drops", "Audited lending protocol"] },
  drift:     { base: 35, factors: ["Perpetuals platform", "Liquidation risk", "Smart contract complexity"] },
  jupiter:   { base: 15, factors: ["Aggregator (minimal direct exposure)", "JLP vault risk"] },
};

export class YieldScanner {
  private config: YieldScoutConfig;

  constructor(config: YieldScoutConfig = {}) {
    this.config = {
      minApy: config.minApy ?? 5,
      maxRiskScore: config.maxRiskScore ?? 60,
      minTvl: config.minTvl ?? 100_000,
      protocols: config.protocols ?? ["marinade", "orca", "raydium", "marginfi", "kamino"],
      mockMode: config.mockMode ?? true,
    };
  }

  /**
   * Main scan: returns all yield opportunities above thresholds.
   * In production, this would call each protocol's API or on-chain data.
   */
  async scanAllProtocols(): Promise<YieldOpportunity[]> {
    console.log("[YieldScanner] Scanning Solana DeFi protocols for yield opportunities...");
    
    let opportunities: YieldOpportunity[];
    
    if (this.config.mockMode) {
      opportunities = this.generateMockOpportunities();
    } else {
      opportunities = await this.fetchLiveOpportunities();
    }

    // Filter by config thresholds
    const filtered = opportunities.filter(opp => {
      if (opp.totalApy < (this.config.minApy ?? 5)) return false;
      if (opp.riskScore > (this.config.maxRiskScore ?? 60)) return false;
      if (opp.tvl < (this.config.minTvl ?? 100_000)) return false;
      if (this.config.protocols && !this.config.protocols.includes(opp.protocol)) return false;
      return true;
    });

    // Sort by risk-adjusted APY (total APY / risk score * 100)
    filtered.sort((a, b) => {
      const scoreA = a.totalApy / Math.max(a.riskScore, 1);
      const scoreB = b.totalApy / Math.max(b.riskScore, 1);
      return scoreB - scoreA;
    });

    console.log(`[YieldScanner] Found ${filtered.length} opportunities meeting criteria (from ${opportunities.length} total scanned)`);
    return filtered;
  }

  /**
   * Fetch live APY data from protocol APIs.
   * Each protocol has different data availability — we handle partial data gracefully.
   */
  private async fetchLiveOpportunities(): Promise<YieldOpportunity[]> {
    // In production: parallel fetch from each protocol's API
    // Marinade: https://api.marinade.finance/msol/apy/1y
    // Orca: https://api.mainnet.orca.so/v1/whirlpool/list
    // Raydium: https://api.raydium.io/v2/main/farm/info
    // marginfi: https://app.marginfi.com/api/banks
    
    console.log("[YieldScanner] Live mode: fetching from protocol APIs...");
    // Fall back to mock for now (real implementation would use actual HTTP calls)
    console.log("[YieldScanner] Note: Full live API integration requires API keys. Using enhanced mock data.");
    return this.generateMockOpportunities();
  }

  /**
   * Generate realistic mock yield data for demonstration.
   * Values based on typical Solana DeFi APYs as of early 2026.
   */
  private generateMockOpportunities(): YieldOpportunity[] {
    const now = new Date();
    
    return [
      // Marinade — safest, LST staking
      {
        protocol: "marinade",
        poolName: "mSOL Native Staking",
        poolAddress: "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
        yieldType: "staking",
        baseApy: 7.2,
        rewardApy: 0.8,
        totalApy: 8.0,
        tvl: 1_250_000_000,
        volume24h: 45_000_000,
        tokens: ["SOL", "mSOL"],
        riskLevel: "low",
        riskScore: 10,
        riskFactors: [...PROTOCOL_RISK.marinade.factors],
        estimatedDailyYield: 0.219,
        lastUpdated: now,
        dataSource: "mock",
      },
      {
        protocol: "marinade",
        poolName: "mSOL Liquid Staking",
        poolAddress: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
        yieldType: "staking",
        baseApy: 7.0,
        rewardApy: 1.2,
        totalApy: 8.2,
        tvl: 890_000_000,
        volume24h: 32_000_000,
        tokens: ["SOL", "mSOL"],
        riskLevel: "low",
        riskScore: 12,
        riskFactors: [...PROTOCOL_RISK.marinade.factors, "Slight smart contract overhead vs native"],
        estimatedDailyYield: 0.225,
        lastUpdated: now,
        dataSource: "mock",
      },

      // Orca Whirlpools
      {
        protocol: "orca",
        poolName: "SOL/USDC Whirlpool (0.05%)",
        poolAddress: "HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ",
        yieldType: "liquidity_pool",
        baseApy: 12.4,
        rewardApy: 4.2,
        totalApy: 16.6,
        tvl: 78_000_000,
        volume24h: 24_500_000,
        tokens: ["SOL", "USDC"],
        riskLevel: "medium",
        riskScore: 28,
        riskFactors: ["Impermanent loss risk (volatile pair)", ...PROTOCOL_RISK.orca.factors],
        estimatedDailyYield: 0.455,
        lastUpdated: now,
        dataSource: "mock",
      },
      {
        protocol: "orca",
        poolName: "JUP/USDC Whirlpool",
        poolAddress: "5Z3EqyD9DSAAABbzZFNPxNj5BRKpQVBF5r2E6yLNFFSh",
        yieldType: "liquidity_pool",
        baseApy: 18.5,
        rewardApy: 12.3,
        totalApy: 30.8,
        tvl: 12_000_000,
        volume24h: 8_200_000,
        tokens: ["JUP", "USDC"],
        riskLevel: "high",
        riskScore: 52,
        riskFactors: ["High IL risk (JUP volatile)", "Lower TVL = higher risk", ...PROTOCOL_RISK.orca.factors],
        estimatedDailyYield: 0.844,
        lastUpdated: now,
        dataSource: "mock",
      },

      // Raydium CLMM
      {
        protocol: "raydium",
        poolName: "SOL-USDC CLMM",
        poolAddress: "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
        yieldType: "liquidity_pool",
        baseApy: 14.8,
        rewardApy: 6.1,
        totalApy: 20.9,
        tvl: 45_000_000,
        volume24h: 18_700_000,
        tokens: ["SOL", "USDC"],
        riskLevel: "medium",
        riskScore: 35,
        riskFactors: ["CLMM requires active range management", ...PROTOCOL_RISK.raydium.factors],
        estimatedDailyYield: 0.572,
        lastUpdated: now,
        dataSource: "mock",
      },
      {
        protocol: "raydium",
        poolName: "RAY-SOL Farm",
        poolAddress: "AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA",
        yieldType: "farming",
        baseApy: 8.2,
        rewardApy: 22.4,
        totalApy: 30.6,
        tvl: 8_500_000,
        volume24h: 3_100_000,
        tokens: ["RAY", "SOL"],
        riskLevel: "high",
        riskScore: 55,
        riskFactors: ["RAY token reward risk", "Double volatility exposure", "Lower TVL"],
        estimatedDailyYield: 0.838,
        lastUpdated: now,
        dataSource: "mock",
      },

      // marginfi Lending
      {
        protocol: "marginfi",
        poolName: "USDC Lending",
        poolAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        yieldType: "lending",
        baseApy: 6.8,
        rewardApy: 2.1,
        totalApy: 8.9,
        tvl: 320_000_000,
        volume24h: 15_000_000,
        tokens: ["USDC"],
        riskLevel: "low",
        riskScore: 20,
        riskFactors: ["Borrower default risk (mitigated by overcollateralization)", ...PROTOCOL_RISK.marginfi.factors],
        estimatedDailyYield: 0.244,
        lastUpdated: now,
        dataSource: "mock",
      },
      {
        protocol: "marginfi",
        poolName: "SOL Lending",
        poolAddress: "So11111111111111111111111111111111111111112",
        yieldType: "lending",
        baseApy: 5.2,
        rewardApy: 1.8,
        totalApy: 7.0,
        tvl: 180_000_000,
        volume24h: 9_500_000,
        tokens: ["SOL"],
        riskLevel: "low",
        riskScore: 22,
        riskFactors: ["Liquidation risk if borrowers undercollateralized", ...PROTOCOL_RISK.marginfi.factors],
        estimatedDailyYield: 0.192,
        lastUpdated: now,
        dataSource: "mock",
      },

      // Kamino Vaults
      {
        protocol: "kamino",
        poolName: "USDC-SOL Automated Vault",
        poolAddress: "9zNQFernGKm2vdKyFGBuZKZdYFHLb6hBJQVkb5BZbFna",
        yieldType: "vaults",
        baseApy: 11.2,
        rewardApy: 8.4,
        totalApy: 19.6,
        tvl: 28_000_000,
        volume24h: 6_800_000,
        tokens: ["USDC", "SOL"],
        riskLevel: "medium",
        riskScore: 38,
        riskFactors: ["Automated rebalancing risk", "Concentrated liquidity strategy", ...PROTOCOL_RISK.kamino.factors],
        estimatedDailyYield: 0.537,
        lastUpdated: now,
        dataSource: "mock",
      },
    ];
  }

  /**
   * Compute risk level from score.
   */
  static riskLevelFromScore(score: number): RiskLevel {
    if (score <= 20) return "low";
    if (score <= 40) return "medium";
    if (score <= 65) return "high";
    return "very_high";
  }
}
