export * from './types';
export * from './fetcher';
export * from './parser';
import { TransactionFetcher } from './fetcher';
import { InstructionParser } from './parser';
export declare class SolanaAgentSDK {
    private rpcUrl;
    fetcher: TransactionFetcher;
    parser: InstructionParser;
    constructor(rpcUrl: string);
}
