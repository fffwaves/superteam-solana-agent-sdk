import { PublicKey } from '@solana/web3.js';
import { MarinadeStake } from '../types/transaction';

// Marinade Finance program ID
const MARINADE_PROGRAM_ID = 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD';

// mSOL mint address
const MSOL_MINT = 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So';

/**
 * Parse Marinade stake/unstake instructions
 */
export function parseMarinadeStake(
  instruction: any,
  accountKeys: PublicKey[],
  tokenBalanceChanges: Map<string, { mint: string; change: number; decimals: number }>
): MarinadeStake | null {
  const programId = instruction.programId.toBase58();

  // Check if this is a Marinade instruction
  if (programId !== MARINADE_PROGRAM_ID) {
    return null;
  }

  // Look for SOL and mSOL balance changes
  const solChange = Array.from(tokenBalanceChanges.entries()).find(
    ([_, data]) => data.mint === 'SOL' // Native SOL has special handling
  );
  const msolChange = Array.from(tokenBalanceChanges.entries()).find(
    ([_, data]) => data.mint === MSOL_MINT
  );

  if (!solChange && !msolChange) {
    return null;
  }

  // Determine if this is stake or unstake
  const isStake = msolChange ? msolChange[1].change > 0 : false;
  const isUnstake = msolChange ? msolChange[1].change < 0 : false;

  if (!isStake && !isUnstake) {
    return null;
  }

  const solAmount = solChange ? Math.abs(solChange[1].change) : 0;
  const msolAmount = msolChange ? Math.abs(msolChange[1].change) : 0;

  // Calculate exchange rate (SOL/mSOL)
  const exchangeRate = solAmount > 0 && msolAmount > 0 
    ? solAmount / msolAmount 
    : 1.0;

  return {
    type: isStake ? 'stake' : 'unstake',
    solAmount: solAmount.toString(),
    msolAmount: msolAmount.toString(),
    exchangeRate,
  };
}

/**
 * Calculate current APY for Marinade (requires on-chain state)
 */
export async function fetchMarinadeAPY(connection: any): Promise<number> {
  // This would query the Marinade state account for current APY
  // Placeholder implementation - real version would fetch from chain
  return 7.2; // Example APY
}

/**
 * Get current mSOL/SOL exchange rate
 */
export async function fetchMsolExchangeRate(connection: any): Promise<number> {
  // Query Marinade state for current exchange rate
  // Placeholder - real version queries on-chain data
  return 1.12; // Example rate (1 mSOL = 1.12 SOL)
}
