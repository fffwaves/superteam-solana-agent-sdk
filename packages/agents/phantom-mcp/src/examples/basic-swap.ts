/**
 * Basic Swap Example — Phantom MCP Agent
 *
 * Demonstrates how to subclass PhantomMCPAgent with a custom strategy
 * that swaps SOL → USDC when confidence is above threshold.
 *
 * ⚠️  STUB: Uses mock Phantom MCP client. No real transactions are sent.
 *     For real integration, register your App ID at https://phantom.app/developer
 */

import { PhantomMCPAgent } from '../index';
import { PhantomMCPConfig, OpportunityEvaluation, BuyTokenRequest } from '../types';

// Known token mints
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

interface SwapContext {
  currentSolBalance: number;
  usdcPrice: number;
  targetAllocation: number; // % of portfolio to hold in USDC
}

/**
 * SwapAgent — buys USDC when SOL allocation is above target
 */
class SwapAgent extends PhantomMCPAgent {
  private swapThresholdConfidence = 0.7;

  async evaluateOpportunity(context: Record<string, unknown>): Promise<OpportunityEvaluation> {
    const { currentSolBalance, usdcPrice, targetAllocation } = context as unknown as SwapContext;

    // Simple example: if we have more than 1 SOL and USDC price is stable, swap 10%
    const shouldSwap = currentSolBalance > 1.0 && usdcPrice > 0.99;
    const confidence = shouldSwap ? 0.82 : 0.2;
    const swapAmount = currentSolBalance * 0.1; // swap 10% of SOL balance

    if (!shouldSwap || confidence < this.swapThresholdConfidence) {
      return {
        action: 'skip',
        confidence,
        reasoning: `Conditions not met. SOL balance: ${currentSolBalance}, USDC price: ${usdcPrice}`,
      };
    }

    const buyRequest: BuyTokenRequest = {
      outputMint: USDC_MINT,
      inputMint: SOL_MINT,
      amount: swapAmount,
      slippageBps: 50, // 0.5% slippage
      chain: 'solana',
    };

    return {
      action: 'swap',
      confidence,
      reasoning: `Swapping ${swapAmount.toFixed(4)} SOL → USDC. Balance: ${currentSolBalance} SOL, target allocation: ${targetAllocation}%`,
      request: buyRequest,
    };
  }
}

async function main() {
  const config: PhantomMCPConfig = {
    appId: 'YOUR_PHANTOM_APP_ID',          // Get from https://phantom.app/developer
    redirectUrl: 'http://localhost:8080/callback',
    chain: 'solana',
    rpcUrl: 'https://api.devnet.solana.com', // ← devnet only!
    maxTransactionValueSol: 0.5,            // Safety cap: never swap more than 0.5 SOL
    skipSimulation: false,                  // Always simulate (default)
  };

  const agent = new SwapAgent(config);
  await agent.initialize();

  // Simulate a market context
  const context: SwapContext = {
    currentSolBalance: 2.5,
    usdcPrice: 1.001,
    targetAllocation: 40,
  };

  console.log('\n=== Running Phantom MCP Swap Agent ===\n');
  const outcome = await agent.run(context as unknown as Record<string, unknown>);

  if (outcome) {
    console.log('\n=== Outcome ===');
    console.log(`Action: ${outcome.action}`);
    console.log(`Success: ${outcome.success}`);
    console.log(`Reasoning: ${outcome.reasoning}`);
    if (outcome.signature) {
      console.log(`Signature: ${outcome.signature}`);
    }
    if (outcome.error) {
      console.log(`Error: ${outcome.error}`);
    }
  } else {
    console.log('\nAgent decided to skip — no action taken.');
  }

  console.log('\n=== All Outcomes ===');
  console.log(agent.getOutcomes());
}

main().catch(console.error);
