/**
 * Yield Scout Agent Types
 * 
 * Defines all data structures for yield opportunity detection,
 * APY tracking, and swap recommendation logic.
 */

export type YieldProtocol = "marinade" | "orca" | "raydium" | "jupiter" | "kamino" | "drift" | "marginfi";

export type YieldType = "staking" | "liquidity_pool" | "lending" | "farming" | "vaults";

export type RiskLevel = "low" | "medium" | "high" | "very_high";

export interface YieldOpportunity {
  protocol: YieldProtocol;
  poolName: string;
  poolAddress: string;
  yieldType: YieldType;
  
  // APY metrics
  baseApy: number;        // Base yield (e.g., trading fees)
  rewardApy: number;      // Reward token APY
  totalApy: number;       // Combined APY
  
  // Pool metadata
  tvl: number;            // Total Value Locked in USD
  volume24h: number;      // 24h volume in USD
  tokens: string[];       // Token symbols in pool
  
  // Risk signals
  riskLevel: RiskLevel;
  riskScore: number;      // 0-100 (0 = safest)
  riskFactors: string[];  // Human-readable risk reasons
  
  // Recommendation
  recommendedAction?: string;
  estimatedDailyYield?: number;  // In USD for $1000 invested
  
  // Metadata
  lastUpdated: Date;
  dataSource: "live" | "mock";
}

export interface WalletYieldPosition {
  protocol: YieldProtocol;
  poolName: string;
  poolAddress: string;
  entryDate?: Date;
  
  // Current position
  depositedValueUsd: number;
  currentValueUsd: number;
  
  // Yield earned
  yieldEarnedUsd: number;
  yieldEarnedPercent: number;
  
  // Current APY
  currentApy: number;
  
  // Comparison
  betterOpportunities: YieldOpportunity[];  // Opportunities beating this position
}

export interface YieldScoutReport {
  wallet: string;
  timestamp: Date;
  
  // Market opportunities
  topOpportunities: YieldOpportunity[];
  totalOpportunitiesScanned: number;
  
  // Wallet-specific
  currentPositions: WalletYieldPosition[];
  
  // Summary
  summary: YieldSummary;
  
  // Recommendations
  recommendations: YieldRecommendation[];
  
  // Agent decisions
  agentDecisions: AgentDecisionLog[];
}

export interface YieldSummary {
  bestApy: number;
  bestProtocol: string;
  bestPool: string;
  averageMarketApy: number;
  walletCurrentApy: number;  // Weighted average of all positions
  potentialGainUsd: number;  // If reallocated to best opportunities
}

export interface YieldRecommendation {
  type: "enter" | "exit" | "rebalance" | "monitor";
  priority: "urgent" | "high" | "medium" | "low";
  
  fromPool?: string;
  toPool?: string;
  fromProtocol?: YieldProtocol;
  toProtocol?: YieldProtocol;
  
  currentApy?: number;
  targetApy?: number;
  apyImprovement?: number;
  
  estimatedGainUsd?: number;  // Estimated 30-day gain
  
  reasoning: string;
  autoExecutable: boolean;    // Can agent execute without confirmation?
}

export interface AgentDecisionLog {
  timestamp: Date;
  step: string;
  reasoning: string;
  outcome: string;
  confidence: number;  // 0-1
}

export interface YieldScoutConfig {
  rpcUrl?: string;
  minApy?: number;           // Minimum APY to consider (default: 5%)
  maxRiskScore?: number;     // Max risk to consider (default: 60)
  minTvl?: number;           // Minimum TVL in USD (default: 100k)
  protocols?: YieldProtocol[]; // Which protocols to scan
  mockMode?: boolean;
}
