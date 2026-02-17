import { SolanaTransaction } from '../types/transaction';
export interface MEVExposure {
    hasJitoTip: boolean;
    isPotentialSandwich: boolean;
    frontrunRisk: number;
    details: string[];
}
/**
 * Assess MEV exposure for a given transaction
 */
export declare function assessMEVExposure(transaction: SolanaTransaction): MEVExposure;
