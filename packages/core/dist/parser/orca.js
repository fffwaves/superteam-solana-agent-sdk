"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOrcaLiquidity = parseOrcaLiquidity;
exports.calculatePoolShare = calculatePoolShare;
exports.estimateImpermanentLoss = estimateImpermanentLoss;
// Orca program IDs
const ORCA_WHIRLPOOL_PROGRAM_ID = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc';
const ORCA_SWAP_PROGRAM_ID = '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP';
/**
 * Parse Orca add/remove liquidity instructions
 */
function parseOrcaLiquidity(instruction, accountKeys, tokenBalanceChanges) {
    const programId = instruction.programId.toBase58();
    // Check if this is an Orca instruction
    if (programId !== ORCA_WHIRLPOOL_PROGRAM_ID && programId !== ORCA_SWAP_PROGRAM_ID) {
        return null;
    }
    const changes = Array.from(tokenBalanceChanges.entries());
    // Liquidity operations involve at least 2 tokens + LP token
    if (changes.length < 2) {
        return null;
    }
    // Separate LP token changes from pool token changes
    // LP tokens typically have "LP" in the symbol or specific known addresses
    const lpChanges = changes.filter(([_, data]) => 
    // Heuristic: LP tokens usually have lower total supply or specific naming
    // In production, maintain a registry of known LP token mints
    false // Placeholder - needs proper LP token detection
    );
    const poolTokenChanges = changes.filter(([addr]) => !lpChanges.some(([lpAddr]) => lpAddr === addr));
    if (poolTokenChanges.length < 2) {
        return null;
    }
    const [tokenA, tokenB] = poolTokenChanges;
    // Determine if adding or removing liquidity
    const isAdding = tokenA[1].change < 0 && tokenB[1].change < 0; // User sends tokens to pool
    const isRemoving = tokenA[1].change > 0 && tokenB[1].change > 0; // User receives tokens from pool
    if (!isAdding && !isRemoving) {
        return null;
    }
    return {
        type: isAdding ? 'add' : 'remove',
        tokenAMint: tokenA[1].mint,
        tokenBMint: tokenB[1].mint,
        tokenAAmount: Math.abs(tokenA[1].change).toString(),
        tokenBAmount: Math.abs(tokenB[1].change).toString(),
        lpTokensMinted: isAdding && lpChanges.length > 0
            ? lpChanges[0][1].change.toString()
            : undefined,
        lpTokensBurned: isRemoving && lpChanges.length > 0
            ? Math.abs(lpChanges[0][1].change).toString()
            : undefined,
        poolAddress: accountKeys[0]?.toBase58() || 'unknown', // Pool is usually first account
    };
}
/**
 * Calculate pool share percentage
 */
function calculatePoolShare(lpTokenAmount, totalLpSupply) {
    return (lpTokenAmount / totalLpSupply) * 100;
}
/**
 * Estimate impermanent loss for a liquidity position
 */
function estimateImpermanentLoss(priceRatioAtDeposit, currentPriceRatio) {
    const ratio = currentPriceRatio / priceRatioAtDeposit;
    const sqrtRatio = Math.sqrt(ratio);
    const il = (2 * sqrtRatio) / (1 + ratio) - 1;
    return il * 100; // Return as percentage
}
