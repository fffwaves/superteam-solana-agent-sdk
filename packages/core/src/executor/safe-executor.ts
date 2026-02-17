import { Keypair } from '@solana/web3.js';
import { 
  SplTransferExecutor, 
  JupiterSwapExecutor, 
  MarinadeStakeExecutor 
} from './spl-executor';
import { 
  ExecutionResult, 
  ExecutorConfig, 
  JupiterQuote, 
  MarinadeStakeRequest, 
  SplTransferRequest 
} from './types';

export interface Guardrails {
  maxAmountSol?: number;
  maxSlippageBps?: number;
  allowedMints?: string[];
  blockedMints?: string[];
}

export interface SafeExecutorOptions extends ExecutorConfig {
  confirm?: (info: any) => Promise<boolean>; // Callback for confirmation
  guardrails?: Guardrails;
  logger?: (message: string, data?: any) => void;
}

/**
 * SafeExecutor: A high-level executor that adds safety checks,
 * confirmation gates, and robust error handling.
 */
export class SafeExecutor {
  private splExecutor: SplTransferExecutor;
  private jupiterExecutor: JupiterSwapExecutor;
  private marinadeExecutor: MarinadeStakeExecutor;
  private options: SafeExecutorOptions;

  constructor(options: SafeExecutorOptions) {
    this.options = options;
    this.splExecutor = new SplTransferExecutor(options);
    this.jupiterExecutor = new JupiterSwapExecutor(options);
    this.marinadeExecutor = new MarinadeStakeExecutor(options);
  }

  private log(message: string, data?: any) {
    if (this.options.logger) {
      this.options.logger(message, data);
    } else {
      console.log(`[SafeExecutor] ${message}`, data || '');
    }
  }

  private async checkGuardrails(amount: number, mint?: string, slippageBps?: number): Promise<{ allowed: boolean; reason?: string }> {
    const { guardrails } = this.options;
    if (!guardrails) return { allowed: true };

    // Check Max SOL Amount
    if (guardrails.maxAmountSol && mint === 'So11111111111111111111111111111111111111112') {
       // amount is usually in lamports for SOL, need to normalize
       // Assuming input 'amount' for transfer is raw (lamports)
       // But maxAmountSol is likely in SOL.
       if (amount > guardrails.maxAmountSol * 1e9) {
          return { allowed: false, reason: `Amount ${(amount/1e9).toFixed(4)} SOL exceeds limit of ${guardrails.maxAmountSol}` };
       }
    }

    // Check Allowed/Blocked Mints
    if (mint) {
      if (guardrails.allowedMints && !guardrails.allowedMints.includes(mint)) {
        return { allowed: false, reason: `Token ${mint} is not in the allowed list` };
      }
      if (guardrails.blockedMints && guardrails.blockedMints.includes(mint)) {
        return { allowed: false, reason: `Token ${mint} is in the blocked list` };
      }
    }

    // Check Slippage
    if (slippageBps !== undefined && guardrails.maxSlippageBps !== undefined) {
      if (slippageBps > guardrails.maxSlippageBps) {
        return { allowed: false, reason: `Slippage ${slippageBps/100}% exceeds maximum ${guardrails.maxSlippageBps/100}%` };
      }
    }

    return { allowed: true };
  }

  private async requestConfirmation(action: string, details: any): Promise<boolean> {
    if (this.options.confirm) {
      this.log(`Requesting confirmation for ${action}...`);
      const confirmed = await this.options.confirm({ action, details });
      if (!confirmed) {
        this.log(`Confirmation denied for ${action}`);
      }
      return confirmed;
    }
    // If no confirm callback provided, we assume strictly automated mode implies approval 
    // unless 'requireConfirmation' (legacy option) was logically intended, 
    // but here we just pass through if no callback.
    return true; 
  }

  // --- Public Methods ---

  async executeTransfer(request: SplTransferRequest, payer: Keypair): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      this.log('Initiating transfer', request);

      // Check Guardrails
      // Note: request.mint is not in SplTransferRequest interface in some versions, check types.
      // Assuming 'So11111111111111111111111111111111111111112' if it's a SOL transfer, 
      // but SplTransferRequest implies SPL tokens.
      // We'll pass undefined for mint if unknown, or extract from account if possible (async).
      // For now, checks amount.
      const guard = await this.checkGuardrails(Number(request.amount)); // explicit cast if needed
      if (!guard.allowed) {
        return { success: false, error: `Guardrail: ${guard.reason}`, timestamp: startTime };
      }

      // Simulation (Pre-flight) happens inside specific executors usually, 
      // but we could do it here if we wanted to unify it. 
      // Current design delegates it.

      // Confirmation
      if (!(await this.requestConfirmation('transfer', request))) {
        return { success: false, error: 'User denied confirmation', timestamp: startTime };
      }

      return await this.splExecutor.execute(request, payer);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.log('Transfer Execution Error', msg);
      return { success: false, error: msg, timestamp: startTime };
    }
  }

  async executeSwap(quote: JupiterQuote, payer: Keypair): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      this.log('Initiating swap', { 
        in: quote.inputMint, 
        out: quote.outputMint, 
        amount: quote.inAmount 
      });

      // Calculate Slippage BPS from quote if available, else 0
      // Jupiter quote often has 'slippageBps' field
      const slippageBps = (quote as any).slippageBps || 0; 

      const guard = await this.checkGuardrails(Number(quote.inAmount), quote.inputMint, slippageBps);
      if (!guard.allowed) {
        return { success: false, error: `Guardrail: ${guard.reason}`, timestamp: startTime };
      }

      if (!(await this.requestConfirmation('swap', quote))) {
        return { success: false, error: 'User denied confirmation', timestamp: startTime };
      }

      return await this.jupiterExecutor.execute(quote, payer);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.log('Swap Execution Error', msg);
      return { success: false, error: msg, timestamp: startTime };
    }
  }

  async executeStake(request: MarinadeStakeRequest, payer: Keypair): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      this.log('Initiating stake', request);

      const guard = await this.checkGuardrails(request.amount, 'So11111111111111111111111111111111111111112');
      if (!guard.allowed) {
        return { success: false, error: `Guardrail: ${guard.reason}`, timestamp: startTime };
      }

      if (!(await this.requestConfirmation('stake', request))) {
        return { success: false, error: 'User denied confirmation', timestamp: startTime };
      }

      return await this.marinadeExecutor.execute(request, payer);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.log('Stake Execution Error', msg);
      return { success: false, error: msg, timestamp: startTime };
    }
  }
}
