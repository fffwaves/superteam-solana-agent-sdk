import { Keypair } from '@solana/web3.js';
import { SplTransferRequest, ExecutionResult, ExecutorConfig, JupiterQuote, MarinadeStakeRequest } from './types';
/**
 * SplTransferExecutor: Handles SPL token transfers with validation and simulation
 */
export declare class SplTransferExecutor {
    private connection;
    private simulator;
    constructor(config: ExecutorConfig);
    private validateTransfer;
    execute(request: SplTransferRequest, payer: Keypair, config?: {
        skipSimulation?: boolean;
    }): Promise<ExecutionResult>;
}
/**
 * JupiterSwapExecutor: Handles token swaps via Jupiter V6 API
 */
export declare class JupiterSwapExecutor {
    private connection;
    private simulator;
    constructor(config: ExecutorConfig);
    execute(quote: JupiterQuote, payer: Keypair, config?: {
        skipSimulation?: boolean;
    }): Promise<ExecutionResult>;
}
/**
 * MarinadeStakeExecutor: Handles SOL staking to mSOL
 */
export declare class MarinadeStakeExecutor {
    private connection;
    private simulator;
    constructor(config: ExecutorConfig);
    execute(request: MarinadeStakeRequest, payer: Keypair, config?: {
        skipSimulation?: boolean;
    }): Promise<ExecutionResult>;
}
