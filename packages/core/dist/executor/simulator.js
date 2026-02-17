"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSimulator = void 0;
const web3_js_1 = require("@solana/web3.js");
/**
 * TransactionSimulator: Simulates transactions before execution
 * Checks if a transaction will fail before submitting to the blockchain
 */
class TransactionSimulator {
    constructor(config) {
        this.connection = new web3_js_1.Connection(config.rpcUrl, config.commitment || 'confirmed');
    }
    /**
     * Simulate a transaction to check if it will succeed
     * @param transaction - The transaction to simulate
     * @param signers - Optional signers for the transaction
     * @returns SimulationResult with success status and logs
     */
    async simulate(transaction, signers) {
        try {
            let simulationResult;
            if ('version' in transaction) {
                // VersionedTransaction
                simulationResult = await this.connection.simulateTransaction(transaction);
            }
            else {
                // Regular Transaction
                simulationResult = await this.connection.simulateTransaction(transaction, signers);
            }
            const logs = simulationResult.value.logs || [];
            const err = simulationResult.value.err;
            const computeUnitsUsed = this.extractComputeUnitsUsed(logs);
            const result = {
                success: !err,
                logs,
                err,
                computeUnitsUsed,
            };
            return result;
        }
        catch (error) {
            return {
                success: false,
                err: error instanceof Error ? error.message : String(error),
                logs: [],
            };
        }
    }
    /**
     * Extract compute units used from transaction logs
     */
    extractComputeUnitsUsed(logs) {
        if (!logs)
            return undefined;
        for (const log of logs) {
            const match = log.match(/Consumed (\d+) of (\d+) compute units/);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
        return undefined;
    }
    /**
     * Check if transaction logs contain errors
     */
    hasError(logs) {
        if (!logs)
            return false;
        return logs.some((log) => log.includes('Error') || log.includes('failed'));
    }
    /**
     * Extract error message from logs
     */
    extractErrorMessage(logs) {
        if (!logs)
            return 'Unknown error';
        for (const log of logs) {
            if (log.includes('Error:')) {
                return log;
            }
            if (log.includes('failed')) {
                return log;
            }
        }
        return 'Unknown error in logs';
    }
}
exports.TransactionSimulator = TransactionSimulator;
