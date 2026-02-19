/**
 * Phantom MCP Agent
 *
 * A reference agent that delegates transaction signing to Phantom wallet
 * via the MCP (Model Context Protocol) server — no private keys needed.
 *
 * Flow:
 *   Agent decides → Decision Engine evaluates → Safe Executor simulates
 *   → Phantom MCP signs → tx submitted to Solana RPC
 *
 * ⚠️  WARNING: @phantom/mcp-server is in preview. Use a dedicated test wallet.
 *     NEVER use mainnet assets with this agent.
 */

import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { PhantomMCPConfig, OpportunityEvaluation, AgentOutcome, SigningRequest, TransferRequest, BuyTokenRequest } from './types';
import { PhantomMCPClient } from './mcp-client';

export { PhantomMCPConfig, OpportunityEvaluation, AgentOutcome } from './types';
export { PhantomMCPClient } from './mcp-client';

export class PhantomMCPAgent {
  private config: PhantomMCPConfig;
  private client: PhantomMCPClient;
  private connection: Connection;
  private outcomes: AgentOutcome[] = [];

  constructor(config: PhantomMCPConfig) {
    this.config = config;
    this.client = new PhantomMCPClient(config);
    this.connection = new Connection(config.rpcUrl, 'confirmed');
  }

  /**
   * Initialize agent — connect to Phantom MCP server
   */
  async initialize(): Promise<void> {
    console.log('[PhantomMCPAgent] Connecting to Phantom MCP...');
    await this.client.connect();

    const wallets = await this.client.getWalletAddresses();
    console.log(`[PhantomMCPAgent] Connected wallets: ${wallets.length}`);
    wallets.forEach(w => console.log(`  ${w.chain}: ${w.address}`));
  }

  /**
   * Evaluate an opportunity and decide whether to act
   * Override this in subclasses to implement custom strategy
   */
  async evaluateOpportunity(context: Record<string, unknown>): Promise<OpportunityEvaluation> {
    console.log('[PhantomMCPAgent] Evaluating opportunity...', context);

    // Default: conservative — skip unless confidence is high
    // Subclasses should override with real logic (e.g., yield comparison, risk scoring)
    return {
      action: 'skip',
      confidence: 0,
      reasoning: 'Base PhantomMCPAgent always skips. Override evaluateOpportunity() with your strategy.',
    };
  }

  /**
   * Execute a signing request via Phantom MCP
   * Always simulates first unless skipSimulation is explicitly set (logs a warning)
   */
  async executeSigningRequest(request: SigningRequest): Promise<AgentOutcome> {
    const start = Date.now();

    // Safety guardrail: check transaction value cap
    if (
      this.config.maxTransactionValueSol !== undefined &&
      request.estimatedFeeSol !== undefined &&
      request.estimatedFeeSol > this.config.maxTransactionValueSol
    ) {
      const outcome: AgentOutcome = {
        timestamp: start,
        action: request.description,
        success: false,
        reasoning: `Blocked: estimated fee ${request.estimatedFeeSol} SOL exceeds cap of ${this.config.maxTransactionValueSol} SOL`,
      };
      this.outcomes.push(outcome);
      console.warn(`[PhantomMCPAgent] ⛔ Transaction blocked by value cap`);
      return outcome;
    }

    // Simulation step
    if (!this.config.skipSimulation) {
      console.log('[PhantomMCPAgent] Simulating transaction before signing...');
      try {
        await this.simulateTransaction(request.transaction);
        console.log('[PhantomMCPAgent] ✅ Simulation passed');
      } catch (err) {
        const outcome: AgentOutcome = {
          timestamp: start,
          action: request.description,
          success: false,
          error: `Simulation failed: ${err instanceof Error ? err.message : String(err)}`,
          reasoning: 'Transaction rejected after simulation failure — not sent to Phantom',
        };
        this.outcomes.push(outcome);
        return outcome;
      }
    } else {
      console.warn('[PhantomMCPAgent] ⚠️  skipSimulation=true — proceeding without simulation check!');
    }

    // Sign via Phantom MCP
    console.log(`[PhantomMCPAgent] Sending to Phantom for signing: ${request.description}`);
    const result = await this.client.signTransaction(request);

    const outcome: AgentOutcome = {
      timestamp: start,
      action: request.description,
      success: result.success,
      signature: result.signature,
      error: result.error,
      reasoning: result.success
        ? `Signed and submitted. Sig: ${result.signature}`
        : `Phantom signing failed: ${result.error}`,
    };
    this.outcomes.push(outcome);
    return outcome;
  }

  /**
   * Execute a token transfer via Phantom MCP
   */
  async executeTransfer(request: TransferRequest): Promise<AgentOutcome> {
    console.log(`[PhantomMCPAgent] Transfer: ${request.amount} ${request.mint ?? 'SOL'} → ${request.toAddress}`);
    const result = await this.client.transferTokens(request);
    const outcome: AgentOutcome = {
      timestamp: Date.now(),
      action: `Transfer ${request.amount} ${request.mint ?? 'SOL'}`,
      success: result.success,
      signature: result.signature,
      error: result.error,
      reasoning: result.success ? `Transfer submitted. Sig: ${result.signature}` : `Transfer failed: ${result.error}`,
    };
    this.outcomes.push(outcome);
    return outcome;
  }

  /**
   * Execute a token buy via Phantom MCP (routes through Jupiter)
   */
  async executeBuy(request: BuyTokenRequest): Promise<AgentOutcome> {
    console.log(`[PhantomMCPAgent] Buy ${request.outputMint} with ${request.amount} ${request.inputMint ?? 'SOL'}`);
    const result = await this.client.buyToken(request);
    const outcome: AgentOutcome = {
      timestamp: Date.now(),
      action: `Buy ${request.outputMint}`,
      success: result.success,
      signature: result.signature,
      error: result.error,
      reasoning: result.success ? `Buy submitted. Sig: ${result.signature}` : `Buy failed: ${result.error}`,
    };
    this.outcomes.push(outcome);
    return outcome;
  }

  /**
   * Run the agent loop: evaluate → decide → execute
   */
  async run(context: Record<string, unknown>): Promise<AgentOutcome | null> {
    if (!this.client.isConnected()) {
      await this.initialize();
    }

    const evaluation = await this.evaluateOpportunity(context);
    console.log(`[PhantomMCPAgent] Decision: ${evaluation.action} (confidence: ${(evaluation.confidence * 100).toFixed(0)}%)`);
    console.log(`[PhantomMCPAgent] Reasoning: ${evaluation.reasoning}`);

    if (evaluation.action === 'skip' || !evaluation.request) {
      return null;
    }

    // Route to correct executor based on action type
    if (evaluation.action === 'transfer' && 'toAddress' in evaluation.request) {
      return this.executeTransfer(evaluation.request as TransferRequest);
    }

    if (evaluation.action === 'swap' && 'outputMint' in evaluation.request) {
      return this.executeBuy(evaluation.request as BuyTokenRequest);
    }

    if ('transaction' in evaluation.request) {
      return this.executeSigningRequest(evaluation.request as SigningRequest);
    }

    return null;
  }

  /**
   * Get all past outcomes for this agent session
   */
  getOutcomes(): AgentOutcome[] {
    return [...this.outcomes];
  }

  /**
   * Simulate a transaction against the RPC before sending to Phantom
   */
  private async simulateTransaction(tx: Transaction): Promise<void> {
    // Note: real simulation needs a recent blockhash and fee payer set
    // This is a best-effort check; Safe Executor from core provides more robust simulation
    const result = await this.connection.simulateTransaction(tx);
    if (result.value.err) {
      throw new Error(`RPC simulation error: ${JSON.stringify(result.value.err)}`);
    }
  }
}
