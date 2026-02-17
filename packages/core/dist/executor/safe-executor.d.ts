import { Keypair } from '@solana/web3.js';
import { ExecutionResult, ExecutorConfig, JupiterQuote, MarinadeStakeRequest, SplTransferRequest } from './types';
export interface Guardrails {
    maxAmountSol?: number;
    maxSlippageBps?: number;
    allowedMints?: string[];
    blockedMints?: string[];
}
export interface SafeExecutorOptions extends ExecutorConfig {
    confirm?: (info: any) => Promise<boolean>;
    guardrails?: Guardrails;
    logger?: (message: string, data?: any) => void;
}
/**
 * SafeExecutor: A high-level executor that adds safety checks,
 * confirmation gates, and robust error handling.
 */
export declare class SafeExecutor {
    private splExecutor;
    private jupiterExecutor;
    private marinadeExecutor;
    private options;
    constructor(options: SafeExecutorOptions);
    private log;
    private checkGuardrails;
    private requestConfirmation;
    executeTransfer(request: SplTransferRequest, payer: Keypair): Promise<ExecutionResult>;
    executeSwap(quote: JupiterQuote, payer: Keypair): Promise<ExecutionResult>;
    executeStake(request: MarinadeStakeRequest, payer: Keypair): Promise<ExecutionResult>;
}
