import { SolanaTransaction } from '../types/transaction';
export interface SuspiciousPattern {
    type: 'rapid_transfers' | 'wash_trading' | 'unusual_volume' | 'new_account_activity';
    confidence: number;
    description: string;
}
/**
 * Detect suspicious patterns in a set of transactions
 */
export declare function detectSuspiciousPatterns(transactions: SolanaTransaction[], userAddress: string): SuspiciousPattern[];
/**
 * Check for unusually large transfers relative to historical mean
 */
export declare function detectVolumeSpikes(currentAmount: number, historicalAmounts: number[]): boolean;
