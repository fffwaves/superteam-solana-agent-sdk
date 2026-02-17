import { PublicKey } from '@solana/web3.js';
import { MarinadeStake } from '../types/transaction';
/**
 * Parse Marinade stake/unstake instructions
 */
export declare function parseMarinadeStake(instruction: any, accountKeys: PublicKey[], tokenBalanceChanges: Map<string, {
    mint: string;
    change: number;
    decimals: number;
}>): MarinadeStake | null;
/**
 * Calculate current APY for Marinade (requires on-chain state)
 */
export declare function fetchMarinadeAPY(connection: any): Promise<number>;
/**
 * Get current mSOL/SOL exchange rate
 */
export declare function fetchMsolExchangeRate(connection: any): Promise<number>;
