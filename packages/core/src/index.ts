// Export all types and interfaces
export * from './types';
export * from './types/index';
export * from './executor/types';
export * from './decision/types';
export * from './risk/rug-detector';
export * from './risk/mev-detector';
export * from './risk/portfolio-risk';
export * from './risk/token-metadata';
export * from './risk/pattern-detector';
export * from './risk/confidence-scorer';

// Export core functionality
export * from './fetcher';
export * from './parser';
export * from './executor/safe-executor';
export * from './executor/spl-executor';
export * from './executor/simulator';
export * from './decision/engine';
export * from './decision/outcome-tracker';
export * from './decision/risk-analyzer';

// Export unified SDK class
import { Connection, Keypair } from '@solana/web3.js';
import { TransactionFetcher } from './fetcher';
import { InstructionParser } from './parser';
import { SafeExecutor, SafeExecutorOptions } from './executor/safe-executor';
import { DecisionEngine } from './decision/engine';
import { OutcomeTracker } from './decision/outcome-tracker';
import { ExecutorConfig } from './executor/types';

export interface SolanaAgentConfig extends Partial<SafeExecutorOptions> {
  rpcUrl: string;
  openaiApiKey?: string;
}

export class SolanaAgentSDK {
  public connection: Connection;
  public fetcher: TransactionFetcher;
  public parser: InstructionParser;
  public executor: SafeExecutor;
  public decisionEngine: DecisionEngine;
  public outcomeTracker: OutcomeTracker;

  constructor(config: SolanaAgentConfig) {
    this.connection = new Connection(config.rpcUrl, config.commitment || 'confirmed');
    
    this.fetcher = new TransactionFetcher(this.connection);
    this.parser = new InstructionParser();
    
    // Initialize SafeExecutor with config
    this.executor = new SafeExecutor({
      commitment: config.commitment || 'confirmed',
      ...config
    });

    this.decisionEngine = new DecisionEngine();
    this.outcomeTracker = new OutcomeTracker();
  }

  /**
   * Helper to quickly setup a risk analyzer
   */
  public setupRiskAnalyzer() {
    // Import dynamically to avoid circular dependencies if any
    const { RiskAnalyzer } = require('./decision/risk-analyzer');
    this.decisionEngine.registerAnalyzer(new RiskAnalyzer());
  }
}
