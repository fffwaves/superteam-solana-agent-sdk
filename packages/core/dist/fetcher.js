"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFetcher = void 0;
const web3_js_1 = require("@solana/web3.js");
class TransactionFetcher {
    constructor(connection) {
        this.connection = connection;
    }
    async fetchTransaction(signature) {
        const tx = await this.connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        });
        if (!tx)
            return null;
        return {
            signature,
            slot: tx.slot,
            blockTime: tx.blockTime || 0,
            instructions: tx.transaction.message.instructions.map((ix) => ({
                programId: new web3_js_1.PublicKey(ix.programId),
                data: ix.data || '',
                accounts: (ix.accounts || []).map((a) => new web3_js_1.PublicKey(a)),
            })),
            raw: tx,
        };
    }
    async fetchAddressHistory(address, limit = 20) {
        const signatures = await this.connection.getSignaturesForAddress(address, { limit });
        return signatures.map(s => s.signature);
    }
}
exports.TransactionFetcher = TransactionFetcher;
