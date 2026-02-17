"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaAgentSDK = void 0;
// Export all types and interfaces
__exportStar(require("./types"), exports);
__exportStar(require("./executor/types"), exports);
__exportStar(require("./decision/types"), exports);
__exportStar(require("./risk/rug-detector"), exports);
__exportStar(require("./risk/mev-detector"), exports);
__exportStar(require("./risk/portfolio-risk"), exports);
__exportStar(require("./risk/token-metadata"), exports);
__exportStar(require("./risk/pattern-detector"), exports);
// Export core functionality
__exportStar(require("./fetcher"), exports);
__exportStar(require("./parser"), exports);
__exportStar(require("./executor/safe-executor"), exports);
__exportStar(require("./executor/spl-executor"), exports);
__exportStar(require("./executor/simulator"), exports);
__exportStar(require("./decision/engine"), exports);
__exportStar(require("./decision/outcome-tracker"), exports);
__exportStar(require("./decision/risk-analyzer"), exports);
// Export unified SDK class
const web3_js_1 = require("@solana/web3.js");
const fetcher_1 = require("./fetcher");
const parser_1 = require("./parser");
const safe_executor_1 = require("./executor/safe-executor");
const engine_1 = require("./decision/engine");
const outcome_tracker_1 = require("./decision/outcome-tracker");
class SolanaAgentSDK {
    constructor(config) {
        this.connection = new web3_js_1.Connection(config.rpcUrl, config.commitment || 'confirmed');
        this.fetcher = new fetcher_1.TransactionFetcher(this.connection);
        this.parser = new parser_1.InstructionParser();
        // Initialize SafeExecutor with config
        this.executor = new safe_executor_1.SafeExecutor({
            commitment: config.commitment || 'confirmed',
            ...config
        });
        this.decisionEngine = new engine_1.DecisionEngine();
        this.outcomeTracker = new outcome_tracker_1.OutcomeTracker();
    }
    /**
     * Helper to quickly setup a risk analyzer
     */
    setupRiskAnalyzer() {
        // Import dynamically to avoid circular dependencies if any
        const { RiskAnalyzer } = require('./decision/risk-analyzer');
        this.decisionEngine.registerAnalyzer(new RiskAnalyzer());
    }
}
exports.SolanaAgentSDK = SolanaAgentSDK;
