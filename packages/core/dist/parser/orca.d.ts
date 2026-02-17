import { PublicKey } from '@solana/web3.js';
export interface OrcaLiquidityOp {
    type: 'add' | 'remove';
    tokenAMint: string;
    tokenBMint: string;
    tokenAAmount: string;
    tokenBAmount: string;
    lpTokensMinted?: string;
    lpTokensBurned?: string;
    poolAddress: string;
}
/**
 * Parse Orca add/remove liquidity instructions
 */
export declare function parseOrcaLiquidity(instruction: any, accountKeys: PublicKey[], tokenBalanceChanges: Map<string, {
    mint: string;
    change: number;
    decimals: number;
}>): OrcaLiquidityOp | null;
/**
 * Calculate pool share percentage
 */
export declare function calculatePoolShare(lpTokenAmount: number, totalLpSupply: number): number;
/**
 * Estimate impermanent loss for a liquidity position
 */
export declare function estimateImpermanentLoss(priceRatioAtDeposit: number, currentPriceRatio: number): number;
