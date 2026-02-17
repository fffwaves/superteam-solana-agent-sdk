import { Connection } from '@solana/web3.js';
import { RugPullRisk } from './rug-detector';
export interface TokenBalance {
    mint: string;
    amount: number;
    valueUsd?: number;
}
export interface PortfolioRiskAssessment {
    overallRiskScore: number;
    concentrationScore: number;
    tokenRisks: Map<string, RugPullRisk>;
    topHoldingsConcentration: number;
    stabilityScore: number;
    details: string[];
}
/**
 * Assess overall portfolio risk
 */
export declare function assessPortfolioRisk(connection: Connection, balances: TokenBalance[]): Promise<PortfolioRiskAssessment>;
