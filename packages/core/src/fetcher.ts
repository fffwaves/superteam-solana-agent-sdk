import { Connection, PublicKey } from '@solana/web3.js';
import { SolanaTransaction, InstructionType } from './types/index';

export class TransactionFetcher {
  constructor(private connection: Connection) {}

  async fetchTransaction(signature: string): Promise<SolanaTransaction | null> {
    const tx = await this.connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) return null;

    return {
      signature,
      slot: tx.slot,
      blockTime: tx.blockTime || 0,
      success: tx.meta ? !tx.meta.err : true,
      fee: tx.meta ? tx.meta.fee : 0,
      instructions: tx.transaction.message.instructions.map((ix: any) => ({
        programId: ix.programId.toString(),
        programName: 'unknown',
        type: InstructionType.UNKNOWN,
        data: ix.data || '',
        accounts: (ix.accounts || []).map((a: any) => a.toString()),
      })),
      balanceChanges: [], // This would need more complex parsing
      summary: 'Transaction fetched from blockchain',
    };
  }

  async fetchAddressHistory(address: PublicKey, limit: number = 20): Promise<string[]> {
    const signatures = await this.connection.getSignaturesForAddress(address, { limit });
    return signatures.map(s => s.signature);
  }

  async fetchAllTransactions(address: string, limit: number = 20): Promise<SolanaTransaction[]> {
    const pubkey = new PublicKey(address);
    const signatures = await this.fetchAddressHistory(pubkey, limit);
    const transactions = await Promise.all(
      signatures.map(sig => this.fetchTransaction(sig))
    );
    return transactions.filter((tx): tx is SolanaTransaction => tx !== null);
  }
}
