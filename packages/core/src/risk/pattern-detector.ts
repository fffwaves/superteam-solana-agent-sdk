import { SolanaTransaction } from '../types/transaction';

export interface SuspiciousPattern {
  type: 'rapid_transfers' | 'wash_trading' | 'unusual_volume' | 'new_account_activity';
  confidence: number;
  description: string;
}

/**
 * Detect suspicious patterns in a set of transactions
 */
export function detectSuspiciousPatterns(
  transactions: SolanaTransaction[],
  userAddress: string
): SuspiciousPattern[] {
  const patterns: SuspiciousPattern[] = [];

  // Sort by time
  const sorted = [...transactions].sort((a, b) => a.blockTime - b.blockTime);

  // 1. Detect rapid transfers (spamming)
  if (sorted.length >= 5) {
    const timeSpan = sorted[sorted.length - 1].blockTime - sorted[0].blockTime;
    const frequency = sorted.length / (timeSpan / 60); // tx per minute
    
    if (frequency > 20) {
      patterns.push({
        type: 'rapid_transfers',
        confidence: 0.8,
        description: `High transaction frequency: ${frequency.toFixed(1)} tx/min`,
      });
    }
  }

  // 2. Detect wash trading (A -> B -> A)
  // This would require deeper analysis of account movement
  
  // 3. New account activity
  // Check if first transaction in window is very recent
  
  return patterns;
}

/**
 * Check for unusually large transfers relative to historical mean
 */
export function detectVolumeSpikes(
  currentAmount: number,
  historicalAmounts: number[]
): boolean {
  if (historicalAmounts.length < 5) return false;
  
  const mean = historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length;
  const stdDev = Math.sqrt(
    historicalAmounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / historicalAmounts.length
  );
  
  return currentAmount > mean + (3 * stdDev);
}
