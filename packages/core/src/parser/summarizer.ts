import { ParsedTransaction, InstructionType } from '../types/transaction';
import { JupiterSwap } from '../types/transaction';
import { MarinadeStake } from '../types/transaction';

/**
 * Generate human-readable summary for a transaction
 */
export function summarizeTransaction(tx: ParsedTransaction): string {
  if (!tx.success) {
    return `❌ Transaction failed (${tx.signature.slice(0, 8)}...)`;
  }

  const summaries: string[] = [];

  // Group instructions by type
  const instructionsByType = tx.instructions.reduce((acc, ix) => {
    if (!acc[ix.type]) acc[ix.type] = [];
    acc[ix.type].push(ix);
    return acc;
  }, {} as Record<InstructionType, any[]>);

  // Summarize each type
  for (const [type, instructions] of Object.entries(instructionsByType)) {
    switch (type as InstructionType) {
      case InstructionType.JUPITER_SWAP:
        summaries.push(summarizeJupiterSwaps(instructions));
        break;
      case InstructionType.MARINADE_STAKE:
        summaries.push(summarizeMarinadeStakes(instructions));
        break;
      case InstructionType.SPL_TRANSFER:
        summaries.push(summarizeSPLTransfers(instructions));
        break;
      case InstructionType.SYSTEM_TRANSFER:
        summaries.push(summarizeSystemTransfers(instructions));
        break;
      case InstructionType.ORCA_SWAP:
        summaries.push(summarizeOrcaOps(instructions));
        break;
      default:
        summaries.push(`${instructions.length}x ${type}`);
    }
  }

  return summaries.join(' · ');
}

function summarizeJupiterSwaps(swaps: any[]): string {
  if (swaps.length === 1) {
    const swap = swaps[0].data as JupiterSwap;
    const input = swap.inputSymbol || swap.inputMint.slice(0, 6);
    const output = swap.outputSymbol || swap.outputMint.slice(0, 6);
    return `🔄 Swapped ${input} → ${output}`;
  }
  return `🔄 ${swaps.length} swaps`;
}

function summarizeMarinadeStakes(stakes: any[]): string {
  if (stakes.length === 1) {
    const stake = stakes[0].data as MarinadeStake;
    if (stake.type === 'stake') {
      return `🔒 Staked ${parseFloat(stake.solAmount).toFixed(2)} SOL → mSOL`;
    } else {
      return `🔓 Unstaked ${parseFloat(stake.msolAmount).toFixed(2)} mSOL → SOL`;
    }
  }
  return `🔒 ${stakes.length} Marinade ops`;
}

function summarizeSPLTransfers(transfers: any[]): string {
  if (transfers.length === 1) {
    const transfer = transfers[0].data;
    const symbol = transfer.symbol || 'tokens';
    const amount = parseFloat(transfer.humanAmount || transfer.amount).toFixed(2);
    return `💸 Sent ${amount} ${symbol}`;
  }
  return `💸 ${transfers.length} token transfers`;
}

function summarizeSystemTransfers(transfers: any[]): string {
  const totalLamports = transfers.reduce((sum, t) => sum + (t.data.amount || 0), 0);
  const sol = (totalLamports / 1e9).toFixed(2);
  if (transfers.length === 1) {
    return `💰 Transferred ${sol} SOL`;
  }
  return `💰 ${transfers.length} SOL transfers (${sol} total)`;
}

function summarizeOrcaOps(ops: any[]): string {
  if (ops.length === 1) {
    const op = ops[0].data;
    if (op.type === 'add') {
      return `💧 Added liquidity to ${op.tokenASymbol || 'pool'}`;
    } else {
      return `💧 Removed liquidity from ${op.tokenASymbol || 'pool'}`;
    }
  }
  return `💧 ${ops.length} liquidity ops`;
}

/**
 * Generate emoji-based activity indicator
 */
export function getActivityEmoji(type: InstructionType): string {
  const emojiMap: Record<InstructionType, string> = {
    [InstructionType.JUPITER_SWAP]: '🔄',
    [InstructionType.MARINADE_STAKE]: '🔒',
    [InstructionType.SPL_TRANSFER]: '💸',
    [InstructionType.SYSTEM_TRANSFER]: '💰',
    [InstructionType.ORCA_SWAP]: '💧',
    [InstructionType.RAYDIUM_SWAP]: '🌊',
    [InstructionType.MAGIC_EDEN_TRADE]: '🖼️',
    [InstructionType.UNKNOWN]: '❓',
  };
  return emojiMap[type] || '📦';
}

/**
 * Format balance change for display
 */
export function formatBalanceChange(change: number, symbol: string): string {
  const sign = change >= 0 ? '+' : '';
  const formatted = change.toFixed(4);
  return `${sign}${formatted} ${symbol}`;
}
