import { Connection, PublicKey } from '@solana/web3.js';
import { SolanaTransaction } from './types';
export declare class TransactionFetcher {
    private connection;
    constructor(connection: Connection);
    fetchTransaction(signature: string): Promise<SolanaTransaction | null>;
    fetchAddressHistory(address: PublicKey, limit?: number): Promise<string[]>;
}
