import { SolanaTransaction, InstructionType } from '../types/transaction';

export interface MEVExposure {
  hasJitoTip: boolean;
  isPotentialSandwich: boolean;
  frontrunRisk: number; // 0-1
  details: string[];
}

/**
 * Assess MEV exposure for a given transaction
 */
export function assessMEVExposure(transaction: SolanaTransaction): MEVExposure {
  const details: string[] = [];
  let hasJitoTip = false;
  let isPotentialSandwich = false;
  let frontrunRisk = 0;

  // Known Jito tip accounts
  const JITO_TIP_ACCOUNTS = [
    '96g9s9yUfQUH9as1x8mRRE7zN4L9fS4K7P2oF6U7bS6s',
    'HFqU5x63VTqvS65AnU28G33y8u5qM8X23V64N7YdC9C8',
    'Cw8CFMEUvS8qR6K89L8oMscF7yQv87kK6n47xP9q9t6x',
    'ADaY9s9yUfQUH9as1x8mRRE7zN4L9fS4K7P2oF6U7bS6s',
    'ADuY9s9yUfQUH9as1x8mRRE7zN4L9fS4K7P2oF6U7bS6s',
    'DfY9s9yUfQUH9as1x8mRRE7zN4L9fS4K7P2oF6U7bS6s',
    'D8Y9s9yUfQUH9as1x8mRRE7zN4L9fS4K7P2oF6U7bS6s',
    '3AVi9s9yUfQUH9as1x8mRRE7zN4L9fS4K7P2oF6U7bS6s',
  ];

  // Check for Jito tip instructions
  const hasTipAccount = transaction.instructions.some(ix => 
    ix.accounts.some(acc => JITO_TIP_ACCOUNTS.includes(acc))
  );

  if (hasTipAccount) {
    hasJitoTip = true;
    details.push('Transaction includes a Jito tip - likely part of a bundle');
    // Bundles are generally safer from public mempool frontrunning, 
    // but the tip itself indicates MEV awareness/participation.
    // We lower the frontrun risk score because the user is using a private channel (presumably).
    frontrunRisk = 0.1; 
  }

  // Check for high slippage/price impact in swaps
  transaction.instructions.forEach(ix => {
    if (ix.type === InstructionType.JUPITER_SWAP && ix.data) {
      const swap = ix.data;
      
      // High price impact > 5% is very risky for sandwiching
      if (swap.priceImpact && swap.priceImpact > 0.05) {
        details.push(`High price impact detected: ${(swap.priceImpact * 100).toFixed(2)}%`);
        frontrunRisk = Math.max(frontrunRisk, 0.8);
        isPotentialSandwich = true;
      }
      
      // High slippage tolerance > 1% allows for significant extraction
      if (swap.slippage && swap.slippage > 0.01) {
        details.push(`High slippage tolerance: ${(swap.slippage * 100).toFixed(2)}%`);
        frontrunRisk = Math.max(frontrunRisk, 0.6);
      }
    }
  });

  // Check for Priority Fees (Compute Budget)
  // High priority fees can indicate a war or urgency, increasing sandwich risk if public
  const computeBudgetIx = transaction.instructions.find(ix => 
    ix.programId === 'ComputeBudget111111111111111111111111111111'
  );

  if (computeBudgetIx && !hasJitoTip) {
    // If setting high compute units/price but NOT using Jito, 
    // it might be visible in mempool and targetable.
    // (Simplification: actual parsing of prioritization fee would happen here)
    details.push('Transaction uses Compute Budget (priority) but not Jito - visible in mempool');
    frontrunRisk = Math.max(frontrunRisk, 0.4); 
  }

  if (frontrunRisk > 0.7) {
    isPotentialSandwich = true;
    details.push('Potential sandwich attack detected due to high price impact/slippage');
  }

  return {
    hasJitoTip,
    isPotentialSandwich,
    frontrunRisk,
    details,
  };
}
