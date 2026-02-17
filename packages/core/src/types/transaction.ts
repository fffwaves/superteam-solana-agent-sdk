import { PublicKey } from "@solana/web3.js";

export type SolanaTransaction = ParsedTransaction;
export type SolanaInstruction = ParsedInstruction;

/**
 * Parsed transaction result
 */
export interface ParsedTransaction {
  signature: string;
  blockTime: number | null;
  slot: number;
  success: boolean;
  fee: number;
  instructions: ParsedInstruction[];
  balanceChanges: BalanceChange[];
  summary: string;
}

/**
 * Parsed instruction from a transaction
 */
export interface ParsedInstruction {
  programId: string;
  programName: string;
  type: InstructionType;
  data: any;
  accounts: string[];
}

/**
 * Types of instructions we can parse
 */
export enum InstructionType {
  UNKNOWN = "unknown",
  SPL_TRANSFER = "spl_transfer",
  JUPITER_SWAP = "jupiter_swap",
  MARINADE_STAKE = "marinade_stake",
  ORCA_SWAP = "orca_swap",
  RAYDIUM_SWAP = "raydium_swap",
  MAGIC_EDEN_TRADE = "magic_eden_trade",
  SYSTEM_TRANSFER = "system_transfer",
}

/**
 * Balance change for an account in a transaction
 */
export interface BalanceChange {
  address: string;
  token: string | null; // null for SOL, mint address for SPL tokens
  tokenSymbol: string | null;
  before: number;
  after: number;
  change: number;
}

/**
 * SPL Token transfer details
 */
export interface SPLTransfer {
  source: string;
  destination: string;
  mint: string;
  amount: string;
  decimals: number;
  humanAmount: string;
  symbol?: string;
}

/**
 * Jupiter swap details
 */
export interface JupiterSwap {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  inputSymbol?: string;
  outputSymbol?: string;
  slippage?: number;
  priceImpact?: number;
}

/**
 * Marinade stake details
 */
export interface MarinadeStake {
  type: "stake" | "unstake";
  solAmount: string;
  msolAmount: string;
  exchangeRate: number;
}
