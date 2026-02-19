import { PublicKey, Transaction } from '@solana/web3.js';

// Supported chains (Phantom is multi-chain; Solana is fully implemented, others stubbed)
export type SupportedChain = 'solana' | 'ethereum' | 'bitcoin' | 'sui';

// Phantom MCP tool names as defined in @phantom/mcp-server (preview)
// See: https://phantom.app/mcp-server
export type PhantomMCPTool =
  | 'get_wallet_addresses'
  | 'sign_transaction'
  | 'transfer_tokens'
  | 'buy_token'
  | 'sign_message';

export interface PhantomMCPConfig {
  /** App ID from Phantom Developer Portal (https://phantom.app/developer) */
  appId: string;
  /** OAuth redirect URL — must be registered in Phantom Portal */
  redirectUrl: string;
  /** Target chain (default: solana) */
  chain?: SupportedChain;
  /** RPC endpoint for simulation before signing */
  rpcUrl: string;
  /** Skip simulation before signing (NOT recommended — logs a warning) */
  skipSimulation?: boolean;
  /** Max SOL value per transaction (safety guardrail) */
  maxTransactionValueSol?: number;
}

export interface WalletInfo {
  address: string;
  chain: SupportedChain;
  label?: string;
}

export interface SigningRequest {
  transaction: Transaction;
  chain: SupportedChain;
  /** Human-readable description of what this tx does */
  description: string;
  /** Expected max SOL cost (from simulation) */
  estimatedFeeSol?: number;
}

export interface SigningResult {
  success: boolean;
  signature?: string;
  error?: string;
  /** Whether this was a simulated/dry-run result */
  simulated: boolean;
}

export interface TransferRequest {
  fromAddress: string;
  toAddress: string;
  mint?: string; // SPL token mint; undefined = native SOL
  amount: number;
  chain: SupportedChain;
}

export interface BuyTokenRequest {
  outputMint: string;
  inputMint?: string; // defaults to SOL
  amount: number; // input amount
  slippageBps?: number;
  chain: SupportedChain;
}

export interface OpportunityEvaluation {
  action: 'swap' | 'transfer' | 'stake' | 'skip';
  confidence: number; // 0–1
  reasoning: string;
  request?: SigningRequest | TransferRequest | BuyTokenRequest;
}

export interface AgentOutcome {
  timestamp: number;
  action: string;
  success: boolean;
  signature?: string;
  error?: string;
  reasoning: string;
}
