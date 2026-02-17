import { PublicKey } from '@solana/web3.js';
import { JupiterSwap } from '../types/transaction';
/**
 * Parse Jupiter swap instructions
 */
export declare function parseJupiterSwap(instruction: any, accountKeys: PublicKey[], tokenBalanceChanges: Map<string, {
    mint: string;
    change: number;
}>): JupiterSwap | null;
/**
 * Calculate price impact from swap amounts
 */
export declare function calculatePriceImpact(inputAmount: number, outputAmount: number, marketPrice: number): number;
/**
 * Enrich swap with token metadata
 */
export declare function enrichSwapMetadata(swap: JupiterSwap, tokenMetadata: Map<string, {
    symbol: string;
    decimals: number;
}>): JupiterSwap;
