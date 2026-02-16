import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { SolanaTransaction } from './types';

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
      instructions: tx.transaction.message.instructions.map((ix: any) => ({
        programId: new PublicKey(ix.programId),
        data: ix.data || '',
        accounts: (ix.accounts || []).map((a: any) => new PublicKey(a)),
      })),
      raw: tx,
    };
  }

  async fetchAddressHistory(address: PublicKey, limit: number = 20): Promise<string[]> {
    const signatures = await this.connection.getSignaturesForAddress(address, { limit });
    return signatures.map(s => s.signature);
  }
}
