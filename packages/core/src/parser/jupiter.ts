import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { JupiterSwap } from '../types/transaction';

// Jupiter program IDs
const JUPITER_PROGRAM_ID = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';
const JUPITER_V6_PROGRAM_ID = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';

/**
 * Parse Jupiter swap instructions
 */
export function parseJupiterSwap(
  instruction: any,
  accountKeys: PublicKey[],
  tokenBalanceChanges: Map<string, { mint: string; change: number }>
): JupiterSwap | null {
  const programId = instruction.programId.toBase58();

  // Check if this is a Jupiter instruction
  if (programId !== JUPITER_PROGRAM_ID && programId !== JUPITER_V6_PROGRAM_ID) {
    return null;
  }

  // Jupiter swaps create balance changes - infer from token balance changes
  const changes = Array.from(tokenBalanceChanges.entries());
  
  if (changes.length < 2) {
    // Not enough data to determine swap
    return null;
  }

  // Find the input (negative change) and output (positive change)
  const input = changes.find(([_, data]) => data.change < 0);
  const output = changes.find(([_, data]) => data.change > 0);

  if (!input || !output) {
    return null;
  }

  return {
    inputMint: input[1].mint,
    outputMint: output[1].mint,
    inputAmount: Math.abs(input[1].change).toString(),
    outputAmount: output[1].change.toString(),
    // These will be enriched later with metadata
    inputSymbol: undefined,
    outputSymbol: undefined,
    slippage: undefined,
    priceImpact: undefined,
  };
}

/**
 * Calculate price impact from swap amounts
 */
export function calculatePriceImpact(
  inputAmount: number,
  outputAmount: number,
  marketPrice: number
): number {
  const executionPrice = outputAmount / inputAmount;
  return ((executionPrice - marketPrice) / marketPrice) * 100;
}

/**
 * Enrich swap with token metadata
 */
export function enrichSwapMetadata(
  swap: JupiterSwap,
  tokenMetadata: Map<string, { symbol: string; decimals: number }>
): JupiterSwap {
  const inputMeta = tokenMetadata.get(swap.inputMint);
  const outputMeta = tokenMetadata.get(swap.outputMint);

  return {
    ...swap,
    inputSymbol: inputMeta?.symbol,
    outputSymbol: outputMeta?.symbol,
  };
}
