"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeTransaction = summarizeTransaction;
exports.getActivityEmoji = getActivityEmoji;
exports.formatBalanceChange = formatBalanceChange;
const transaction_1 = require("../types/transaction");
/**
 * Generate human-readable summary for a transaction
 */
function summarizeTransaction(tx) {
    if (!tx.success) {
        return `❌ Transaction failed (${tx.signature.slice(0, 8)}...)`;
    }
    const summaries = [];
    // Group instructions by type
    const instructionsByType = tx.instructions.reduce((acc, ix) => {
        if (!acc[ix.type])
            acc[ix.type] = [];
        acc[ix.type].push(ix);
        return acc;
    }, {});
    // Summarize each type
    for (const [type, instructions] of Object.entries(instructionsByType)) {
        switch (type) {
            case transaction_1.InstructionType.JUPITER_SWAP:
                summaries.push(summarizeJupiterSwaps(instructions));
                break;
            case transaction_1.InstructionType.MARINADE_STAKE:
                summaries.push(summarizeMarinadeStakes(instructions));
                break;
            case transaction_1.InstructionType.SPL_TRANSFER:
                summaries.push(summarizeSPLTransfers(instructions));
                break;
            case transaction_1.InstructionType.SYSTEM_TRANSFER:
                summaries.push(summarizeSystemTransfers(instructions));
                break;
            case transaction_1.InstructionType.ORCA_SWAP:
                summaries.push(summarizeOrcaOps(instructions));
                break;
            default:
                summaries.push(`${instructions.length}x ${type}`);
        }
    }
    return summaries.join(' · ');
}
function summarizeJupiterSwaps(swaps) {
    if (swaps.length === 1) {
        const swap = swaps[0].data;
        const input = swap.inputSymbol || swap.inputMint.slice(0, 6);
        const output = swap.outputSymbol || swap.outputMint.slice(0, 6);
        return `🔄 Swapped ${input} → ${output}`;
    }
    return `🔄 ${swaps.length} swaps`;
}
function summarizeMarinadeStakes(stakes) {
    if (stakes.length === 1) {
        const stake = stakes[0].data;
        if (stake.type === 'stake') {
            return `🔒 Staked ${parseFloat(stake.solAmount).toFixed(2)} SOL → mSOL`;
        }
        else {
            return `🔓 Unstaked ${parseFloat(stake.msolAmount).toFixed(2)} mSOL → SOL`;
        }
    }
    return `🔒 ${stakes.length} Marinade ops`;
}
function summarizeSPLTransfers(transfers) {
    if (transfers.length === 1) {
        const transfer = transfers[0].data;
        const symbol = transfer.symbol || 'tokens';
        const amount = parseFloat(transfer.humanAmount || transfer.amount).toFixed(2);
        return `💸 Sent ${amount} ${symbol}`;
    }
    return `💸 ${transfers.length} token transfers`;
}
function summarizeSystemTransfers(transfers) {
    const totalLamports = transfers.reduce((sum, t) => sum + (t.data.amount || 0), 0);
    const sol = (totalLamports / 1e9).toFixed(2);
    if (transfers.length === 1) {
        return `💰 Transferred ${sol} SOL`;
    }
    return `💰 ${transfers.length} SOL transfers (${sol} total)`;
}
function summarizeOrcaOps(ops) {
    if (ops.length === 1) {
        const op = ops[0].data;
        if (op.type === 'add') {
            return `💧 Added liquidity to ${op.tokenASymbol || 'pool'}`;
        }
        else {
            return `💧 Removed liquidity from ${op.tokenASymbol || 'pool'}`;
        }
    }
    return `💧 ${ops.length} liquidity ops`;
}
/**
 * Generate emoji-based activity indicator
 */
function getActivityEmoji(type) {
    const emojiMap = {
        [transaction_1.InstructionType.JUPITER_SWAP]: '🔄',
        [transaction_1.InstructionType.MARINADE_STAKE]: '🔒',
        [transaction_1.InstructionType.SPL_TRANSFER]: '💸',
        [transaction_1.InstructionType.SYSTEM_TRANSFER]: '💰',
        [transaction_1.InstructionType.ORCA_SWAP]: '💧',
        [transaction_1.InstructionType.RAYDIUM_SWAP]: '🌊',
        [transaction_1.InstructionType.MAGIC_EDEN_TRADE]: '🖼️',
        [transaction_1.InstructionType.UNKNOWN]: '❓',
    };
    return emojiMap[type] || '📦';
}
/**
 * Format balance change for display
 */
function formatBalanceChange(change, symbol) {
    const sign = change >= 0 ? '+' : '';
    const formatted = change.toFixed(4);
    return `${sign}${formatted} ${symbol}`;
}
