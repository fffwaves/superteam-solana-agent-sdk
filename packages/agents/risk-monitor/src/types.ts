/**
 * Risk Monitor Agent Types
 * 
 * Defines all data structures for real-time threat detection,
 * exploit monitoring, and risk alerting.
 */

export type ThreatLevel = "critical" | "high" | "medium" | "low" | "info";

export type ThreatCategory =
  | "rug_pull"
  | "exploit"
  | "flash_loan"
  | "price_manipulation"
  | "mev_attack"
  | "abnormal_tvl_drop"
  | "suspicious_mint"
  | "honeypot"
  | "wallet_drain"
  | "phishing";

export interface ThreatSignal {
  id: string;
  category: ThreatCategory;
  level: ThreatLevel;
  
  // What triggered this
  triggerType: "transaction" | "program" | "token" | "wallet" | "protocol";
  triggerAddress: string;
  triggerSignature?: string;  // Transaction signature if applicable
  
  // Details
  title: string;
  description: string;
  evidence: string[];   // Supporting evidence points
  
  // Impact
  affectedWallet?: string;
  estimatedLossUsd?: number;
  affectedProtocol?: string;
  
  // Confidence
  confidence: number;   // 0-1
  falsePositiveRisk: "low" | "medium" | "high";
  
  // Action
  recommendedAction: string;
  autoMitigationAvailable: boolean;
  
  // Metadata
  detectedAt: Date;
  resolvedAt?: Date;
  resolved: boolean;
}

export interface WalletRiskSnapshot {
  wallet: string;
  timestamp: Date;
  
  // Overall risk
  overallRiskScore: number;    // 0-100
  overallRiskLevel: ThreatLevel;
  
  // Token analysis
  tokenCount: number;
  highRiskTokens: number;
  rugPullTokenCount: number;
  honeypotCount: number;
  
  // Activity analysis
  suspiciousTransactions: number;
  mevExposureCount: number;
  flashLoanInteractions: number;
  
  // Exposure
  totalPortfolioUsd: number;
  atRiskValueUsd: number;        // Value in high-risk positions
  
  // Specific threats
  activeThreats: ThreatSignal[];
}

export interface ProtocolHealthCheck {
  protocol: string;
  programAddress: string;
  
  // Health indicators
  tvlUsd: number;
  tvlChange24h: number;    // Percentage change
  isHealthy: boolean;
  
  // Alerts
  alerts: string[];
  threatLevel: ThreatLevel;
  
  // Metadata
  lastAuditDate?: Date;
  auditFirms?: string[];
  
  checkedAt: Date;
}

export interface RiskMonitorReport {
  wallet: string;
  timestamp: Date;
  
  // Wallet risk
  walletSnapshot: WalletRiskSnapshot;
  
  // Protocol health
  protocolHealthChecks: ProtocolHealthCheck[];
  
  // All threats found
  threats: ThreatSignal[];
  
  // Summary
  summary: RiskSummary;
  
  // Agent reasoning
  agentDecisions: RiskDecisionLog[];
  
  // Next steps
  immediateActions: string[];
}

export interface RiskSummary {
  overallStatus: "safe" | "caution" | "danger" | "critical";
  threatsFound: number;
  criticalThreats: number;
  highThreats: number;
  atRiskValueUsd: number;
  topThreat?: ThreatSignal;
}

export interface RiskDecisionLog {
  timestamp: Date;
  check: string;
  finding: string;
  action: string;
  confidence: number;
}

export interface RiskMonitorConfig {
  rpcUrl?: string;
  mockMode?: boolean;
  
  // Alert thresholds
  minThreatLevel?: ThreatLevel;  // Minimum level to report
  maxRiskScore?: number;          // Alert if wallet risk > this
  
  // What to check
  checkWallet?: boolean;
  checkProtocols?: boolean;
  checkTokens?: boolean;
  
  // Auto-mitigation
  enableAutoMitigation?: boolean;  // Auto-execute safe mitigations
}
