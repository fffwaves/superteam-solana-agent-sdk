import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { SimulationResult, ExecutorConfig } from './types';
/**
 * TransactionSimulator: Simulates transactions before execution
 * Checks if a transaction will fail before submitting to the blockchain
 */
export declare class TransactionSimulator {
    private connection;
    constructor(config: ExecutorConfig);
    /**
     * Simulate a transaction to check if it will succeed
     * @param transaction - The transaction to simulate
     * @param signers - Optional signers for the transaction
     * @returns SimulationResult with success status and logs
     */
    simulate(transaction: Transaction | VersionedTransaction, signers?: any[]): Promise<SimulationResult>;
    /**
     * Extract compute units used from transaction logs
     */
    private extractComputeUnitsUsed;
    /**
     * Check if transaction logs contain errors
     */
    hasError(logs: string[] | null | undefined): boolean;
    /**
     * Extract error message from logs
     */
    extractErrorMessage(logs: string[] | null | undefined): string;
}
