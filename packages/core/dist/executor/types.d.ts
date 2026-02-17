import { PublicKey } from '@solana/web3.js';
export interface ExecutorConfig {
    rpcUrl: string;
    commitment?: 'processed' | 'confirmed' | 'finalized';
    skipSimulation?: boolean;
    maxRetries?: number;
    retryDelayMs?: number;
}
export interface ExecutionResult {
    success: boolean;
    signature?: string;
    error?: string;
    simulationResult?: SimulationResult;
    timestamp: number;
}
export interface SimulationResult {
    success: boolean;
    logs?: string[];
    err?: any;
    computeUnitsUsed?: number;
    returnData?: string;
}
export interface JupiterQuoteRequest {
    inputMint: PublicKey;
    outputMint: PublicKey;
    amount: number;
    slippageBps?: number;
}
export interface JupiterQuote {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: 'ExactIn' | 'ExactOut';
    priceImpactPct: string;
    routePlan: any[];
}
export interface MarinadeStakeRequest {
    userWallet: PublicKey;
    amount: number;
}
export interface SplTransferRequest {
    senderTokenAccount: PublicKey;
    recipientTokenAccount: PublicKey;
    amount: number;
    decimals?: number;
}
