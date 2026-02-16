export * from './types';
export * from './fetcher';
export * from './parser';

import { Connection } from '@solana/web3.js';
import { TransactionFetcher } from './fetcher';
import { InstructionParser } from './parser';

export class SolanaAgentSDK {
  public fetcher: TransactionFetcher;
  public parser: InstructionParser;

  constructor(private rpcUrl: string) {
    const connection = new Connection(rpcUrl);
    this.fetcher = new TransactionFetcher(connection);
    this.parser = new InstructionParser();
  }
}
