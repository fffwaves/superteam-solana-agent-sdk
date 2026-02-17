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
__exportStar(require("./types"), exports);
__exportStar(require("./fetcher"), exports);
__exportStar(require("./parser"), exports);
const web3_js_1 = require("@solana/web3.js");
const fetcher_1 = require("./fetcher");
const parser_1 = require("./parser");
class SolanaAgentSDK {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
        const connection = new web3_js_1.Connection(rpcUrl);
        this.fetcher = new fetcher_1.TransactionFetcher(connection);
        this.parser = new parser_1.InstructionParser();
    }
}
exports.SolanaAgentSDK = SolanaAgentSDK;
