export * from './types';
export * from './executor/types';
export * from './decision/types';
export * from './risk/rug-detector';
export * from './risk/mev-detector';
export * from './risk/portfolio-risk';
export * from './risk/token-metadata';
export * from './risk/pattern-detector';
export * from './fetcher';
export * from './parser';
export * from './executor/safe-executor';
export * from './executor/spl-executor';
export * from './executor/simulator';
export * from './decision/engine';
export * from './decision/outcome-tracker';
export * from './decision/risk-analyzer';
import { Connection } from '@solana/web3.js';
import { TransactionFetcher } from './fetcher';
import { InstructionParser } from './parser';
import { SafeExecutor, SafeExecutorOptions } from './executor/safe-executor';
import { DecisionEngine } from './decision/engine';
import { OutcomeTracker } from './decision/outcome-tracker';
export interface SolanaAgentConfig extends Partial<SafeExecutorOptions> {
    rpcUrl: string;
    openaiApiKey?: string;
}
export declare class SolanaAgentSDK {
    connection: Connection;
    fetcher: TransactionFetcher;
    parser: InstructionParser;
    executor: SafeExecutor;
    decisionEngine: DecisionEngine;
    outcomeTracker: OutcomeTracker;
    constructor(config: SolanaAgentConfig);
    /**
     * Helper to quickly setup a risk analyzer
     */
    setupRiskAnalyzer(): void;
}
