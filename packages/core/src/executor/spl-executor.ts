import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { createTransferCheckedInstruction, getAccount, getMint } from '@solana/spl-token';
import fetch from 'cross-fetch';
import { 
  SplTransferRequest, 
  ExecutionResult, 
  ExecutorConfig, 
  JupiterQuote, 
  MarinadeStakeRequest 
} from './types';
import { TransactionSimulator } from './simulator';

/**
 * SplTransferExecutor: Handles SPL token transfers with validation and simulation
 */
export class SplTransferExecutor {
  private connection: Connection;
  private simulator: TransactionSimulator;

  constructor(config: ExecutorConfig) {
    this.connection = new Connection(config.rpcUrl, config.commitment || 'confirmed');
    this.simulator = new TransactionSimulator(config);
  }

  private async validateTransfer(request: SplTransferRequest): Promise<{ valid: boolean; error?: string }> {
    try {
      const senderAccount = await getAccount(this.connection, request.senderTokenAccount);
      const recipientAccount = await getAccount(this.connection, request.recipientTokenAccount);
      if (senderAccount.amount < BigInt(request.amount)) return { valid: false, error: 'Insufficient balance' };
      if (senderAccount.mint.toString() !== recipientAccount.mint.toString()) return { valid: false, error: 'Token mints do not match' };
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }
  }

  async execute(request: SplTransferRequest, payer: Keypair, config: { skipSimulation?: boolean } = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      const validation = await this.validateTransfer(request);
      if (!validation.valid) return { success: false, error: validation.error, timestamp: startTime };

      const senderAccount = await getAccount(this.connection, request.senderTokenAccount);
      const mintAccount = await getMint(this.connection, senderAccount.mint);
      
      const instruction = createTransferCheckedInstruction(
        request.senderTokenAccount, 
        senderAccount.mint, 
        request.recipientTokenAccount,
        senderAccount.owner, 
        request.amount, 
        request.decimals ?? mintAccount.decimals
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;
      transaction.sign(payer);

      if (!config.skipSimulation) {
        const simulation = await this.simulator.simulate(transaction, [payer]);
        if (!simulation.success) return { success: false, error: this.simulator.extractErrorMessage(simulation.logs), simulationResult: simulation, timestamp: startTime };
      }

      const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
      return { success: true, signature, timestamp: startTime };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', timestamp: startTime };
    }
  }
}

/**
 * JupiterSwapExecutor: Handles token swaps via Jupiter V6 API
 */
export class JupiterSwapExecutor {
  private connection: Connection;
  private simulator: TransactionSimulator;

  constructor(config: ExecutorConfig) {
    this.connection = new Connection(config.rpcUrl, config.commitment || 'confirmed');
    this.simulator = new TransactionSimulator(config);
  }

  async execute(quote: JupiterQuote, payer: Keypair, config: { skipSimulation?: boolean } = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: payer.publicKey.toString(),
          wrapAndUnwrapSol: true,
        }),
      });

      const data = await response.json();
      if (!data.swapTransaction) {
        throw new Error(data.error || 'Failed to get swap transaction from Jupiter');
      }

      const transaction = VersionedTransaction.deserialize(Buffer.from(data.swapTransaction, 'base64'));
      transaction.sign([payer]);

      if (!config.skipSimulation) {
        const simulation = await this.simulator.simulate(transaction, [payer]);
        if (!simulation.success) {
          return {
            success: false,
            error: this.simulator.extractErrorMessage(simulation.logs),
            simulationResult: simulation,
            timestamp: startTime,
          };
        }
      }

      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

      return { success: true, signature, timestamp: startTime };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Jupiter swap failed', timestamp: startTime };
    }
  }
}

/**
 * MarinadeStakeExecutor: Handles SOL staking to mSOL
 */
export class MarinadeStakeExecutor {
  private connection: Connection;
  private simulator: TransactionSimulator;

  constructor(config: ExecutorConfig) {
    this.connection = new Connection(config.rpcUrl, config.commitment || 'confirmed');
    this.simulator = new TransactionSimulator(config);
  }

  async execute(request: MarinadeStakeRequest, payer: Keypair, config: { skipSimulation?: boolean } = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      // For Marinade stake, we'll implement the execution flow with simulation.
      // In a production environment, we'd use @marinade.finance/marinade-ts-sdk
      // For Phase 2, we establish the core logic structure.
      const transaction = new Transaction();
      
      // Note: Actual Marinade deposit instruction would be added here.
      // This serves as the executor framework implementation.
      
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;
      transaction.sign(payer);

      if (!config.skipSimulation) {
        const simulation = await this.simulator.simulate(transaction, [payer]);
        if (!simulation.success) {
          return {
            success: false,
            error: this.simulator.extractErrorMessage(simulation.logs),
            simulationResult: simulation,
            timestamp: startTime,
          };
        }
      }

      const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
      return { success: true, signature, timestamp: startTime };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Marinade stake failed', timestamp: startTime };
    }
  }
}
