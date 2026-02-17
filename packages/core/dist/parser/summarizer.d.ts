import { ParsedTransaction, InstructionType } from '../types/transaction';
/**
 * Generate human-readable summary for a transaction
 */
export declare function summarizeTransaction(tx: ParsedTransaction): string;
/**
 * Generate emoji-based activity indicator
 */
export declare function getActivityEmoji(type: InstructionType): string;
/**
 * Format balance change for display
 */
export declare function formatBalanceChange(change: number, symbol: string): string;
