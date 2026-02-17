import { ParsedTransaction, TokenBalance, PortfolioRiskAssessment } from "@solana-agent-sdk/core";

export interface TokenHolding extends TokenBalance {
  symbol: string;
  priceSol: number;
  totalValueSol: number;
  costBasisSol: number;
  unrealizedPnLSol: number;
  unrealizedPnLPercent: number;
  rugRiskScore: number;
}

export interface PortfolioState {
  walletAddress: string;
  balances: TokenBalance[];
  lastUpdated: number;
  totalValueSol: number;
}

export interface Alert {
  level: 'info' | 'warning' | 'critical';
  type: 'rug_risk' | 'concentration' | 'suspicious_pattern' | 'mev' | 'large_transfer';
  token?: string;
  message: string;
  action?: string;
}

export interface PortfolioReport {
  wallet: string;
  timestamp: number;
  holdings: TokenHolding[];
  riskAssessment: PortfolioRiskAssessment;
  alerts: Alert[];
  recentActivity: ParsedTransaction[];
  recommendedActions: string[];
}
