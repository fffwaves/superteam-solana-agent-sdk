"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarinadeStakeExecutor = exports.JupiterSwapExecutor = exports.SplTransferExecutor = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const simulator_1 = require("./simulator");
/**
 * SplTransferExecutor: Handles SPL token transfers with validation and simulation
 */
class SplTransferExecutor {
    constructor(config) {
        this.connection = new web3_js_1.Connection(config.rpcUrl, config.commitment || 'confirmed');
        this.simulator = new simulator_1.TransactionSimulator(config);
    }
    async validateTransfer(request) {
        try {
            const senderAccount = await (0, spl_token_1.getAccount)(this.connection, request.senderTokenAccount);
            const recipientAccount = await (0, spl_token_1.getAccount)(this.connection, request.recipientTokenAccount);
            if (senderAccount.amount < BigInt(request.amount))
                return { valid: false, error: 'Insufficient balance' };
            if (senderAccount.mint.toString() !== recipientAccount.mint.toString())
                return { valid: false, error: 'Token mints do not match' };
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: error instanceof Error ? error.message : 'Validation failed' };
        }
    }
    async execute(request, payer, config = {}) {
        const startTime = Date.now();
        try {
            const validation = await this.validateTransfer(request);
            if (!validation.valid)
                return { success: false, error: validation.error, timestamp: startTime };
            const senderAccount = await (0, spl_token_1.getAccount)(this.connection, request.senderTokenAccount);
            const mintAccount = await (0, spl_token_1.getMint)(this.connection, senderAccount.mint);
            const instruction = (0, spl_token_1.createTransferCheckedInstruction)(request.senderTokenAccount, senderAccount.mint, request.recipientTokenAccount, senderAccount.owner, request.amount, request.decimals ?? mintAccount.decimals);
            const transaction = new web3_js_1.Transaction().add(instruction);
            const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = payer.publicKey;
            transaction.sign(payer);
            if (!config.skipSimulation) {
                const simulation = await this.simulator.simulate(transaction, [payer]);
                if (!simulation.success)
                    return { success: false, error: this.simulator.extractErrorMessage(simulation.logs), simulationResult: simulation, timestamp: startTime };
            }
            const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [payer]);
            return { success: true, signature, timestamp: startTime };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error', timestamp: startTime };
        }
    }
}
exports.SplTransferExecutor = SplTransferExecutor;
/**
 * JupiterSwapExecutor: Handles token swaps via Jupiter V6 API
 */
class JupiterSwapExecutor {
    constructor(config) {
        this.connection = new web3_js_1.Connection(config.rpcUrl, config.commitment || 'confirmed');
        this.simulator = new simulator_1.TransactionSimulator(config);
    }
    async execute(quote, payer, config = {}) {
        const startTime = Date.now();
        try {
            const response = await (0, cross_fetch_1.default)('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quoteResponse: quote,
                    userPublicKey: payer.publicKey.toString(),
                    wrapAndUnwrapSol: true,
                }),
            });
            const data = await response.json();
            if (!data.swapTransaction) {
                throw new Error(data.error || 'Failed to get swap transaction from Jupiter');
            }
            const transaction = web3_js_1.VersionedTransaction.deserialize(Buffer.from(data.swapTransaction, 'base64'));
            transaction.sign([payer]);
            if (!config.skipSimulation) {
                const simulation = await this.simulator.simulate(transaction, [payer]);
                if (!simulation.success) {
                    return {
                        success: false,
                        error: this.simulator.extractErrorMessage(simulation.logs),
                        simulationResult: simulation,
                        timestamp: startTime,
                    };
                }
            }
            const signature = await this.connection.sendRawTransaction(transaction.serialize());
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            await this.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
            return { success: true, signature, timestamp: startTime };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Jupiter swap failed', timestamp: startTime };
        }
    }
}
exports.JupiterSwapExecutor = JupiterSwapExecutor;
/**
 * MarinadeStakeExecutor: Handles SOL staking to mSOL
 */
class MarinadeStakeExecutor {
    constructor(config) {
        this.connection = new web3_js_1.Connection(config.rpcUrl, config.commitment || 'confirmed');
        this.simulator = new simulator_1.TransactionSimulator(config);
    }
    async execute(request, payer, config = {}) {
        const startTime = Date.now();
        try {
            // For Marinade stake, we'll implement the execution flow with simulation.
            // In a production environment, we'd use @marinade.finance/marinade-ts-sdk
            // For Phase 2, we establish the core logic structure.
            const transaction = new web3_js_1.Transaction();
            // Note: Actual Marinade deposit instruction would be added here.
            // This serves as the executor framework implementation.
            const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = payer.publicKey;
            transaction.sign(payer);
            if (!config.skipSimulation) {
                const simulation = await this.simulator.simulate(transaction, [payer]);
                if (!simulation.success) {
                    return {
                        success: false,
                        error: this.simulator.extractErrorMessage(simulation.logs),
                        simulationResult: simulation,
                        timestamp: startTime,
                    };
                }
            }
            const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [payer]);
            return { success: true, signature, timestamp: startTime };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Marinade stake failed', timestamp: startTime };
        }
    }
}
exports.MarinadeStakeExecutor = MarinadeStakeExecutor;
