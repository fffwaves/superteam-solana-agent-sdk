import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  SimulatedTransactionResponse,
} from '@solana/web3.js';
import { SimulationResult, ExecutorConfig } from './types';

/**
 * TransactionSimulator: Simulates transactions before execution
 * Checks if a transaction will fail before submitting to the blockchain
 */
export class TransactionSimulator {
  private connection: Connection;

  constructor(config: ExecutorConfig) {
    this.connection = new Connection(config.rpcUrl, config.commitment || 'confirmed');
  }

  /**
   * Simulate a transaction to check if it will succeed
   * @param transaction - The transaction to simulate
   * @param signers - Optional signers for the transaction
   * @returns SimulationResult with success status and logs
   */
  async simulate(
    transaction: Transaction | VersionedTransaction,
    signers?: any[]
  ): Promise<SimulationResult> {
    try {
      let simulationResult;
      
      if ('version' in transaction) {
        // VersionedTransaction
        simulationResult = await this.connection.simulateTransaction(transaction as VersionedTransaction);
      } else {
        // Regular Transaction
        simulationResult = await this.connection.simulateTransaction(transaction as Transaction, signers);
      }

      const logs = simulationResult.value.logs || [];
      const err = simulationResult.value.err;
      const computeUnitsUsed = this.extractComputeUnitsUsed(logs);

      const result: SimulationResult = {
        success: !err,
        logs,
        err,
        computeUnitsUsed,
      };

      return result;
    } catch (error) {
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
  private extractComputeUnitsUsed(logs: string[] | null | undefined): number | undefined {
    if (!logs) return undefined;

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
  hasError(logs: string[] | null | undefined): boolean {
    if (!logs) return false;
    return logs.some((log) => log.includes('Error') || log.includes('failed'));
  }

  /**
   * Extract error message from logs
   */
  extractErrorMessage(logs: string[] | null | undefined): string {
    if (!logs) return 'Unknown error';

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
