# Solana Agent SDK — API Reference

> **Version:** 0.1.0 · **License:** MIT · **TypeScript:** 5.x

---

## Installation

```bash
npm install @solana-agent-sdk/core
# or
yarn add @solana-agent-sdk/core
```

**Requirements:** Node.js 20+, TypeScript 5.x (optional but recommended)

---

## Quick SDK Instantiation

```typescript
import { SolanaAgentSDK } from '@solana-agent-sdk/core';

const sdk = new SolanaAgentSDK({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed',
});
```

### `SolanaAgentConfig`

| Property | Type | Default | Description |
|---|---|---|---|
| `rpcUrl` | `string` | — | Solana RPC endpoint URL (required) |
| `commitment` | `Commitment` | `'confirmed'` | Transaction commitment level |
| `guardrails` | `Guardrails` | `undefined` | Safety limits (see SafeExecutor) |
| `confirm` | `(info) => Promise<boolean>` | auto-approve | Confirmation callback for executions |
| `logger` | `(msg, data?) => void` | `console.log` | Custom logger |

### `SolanaAgentSDK` instance

| Property | Type | Description |
|---|---|---|
| `connection` | `Connection` | Raw `@solana/web3.js` Connection |
| `fetcher` | `TransactionFetcher` | Fetch and parse transactions from RPC |
| `parser` | `InstructionParser` | Decode raw Solana instructions |
| `executor` | `SafeExecutor` | Execute swaps/stakes/transfers safely |
| `decisionEngine` | `DecisionEngine` | Run weighted multi-analyzer decisions |
| `outcomeTracker` | `OutcomeTracker` | Track and learn from decision outcomes |

---

## Core Modules

### 1. TransactionFetcher

Fetches and parses raw Solana transactions from the RPC.

```typescript
import { TransactionFetcher } from '@solana-agent-sdk/core';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const fetcher = new TransactionFetcher(connection);

// Fetch last N parsed transactions for a wallet
const txs = await fetcher.fetchAllTransactions(walletAddress, 50);
```

#### `TransactionFetcher` Methods

| Method | Signature | Description |
|---|---|---|
| `fetchAllTransactions` | `(address: string, limit?: number) => Promise<ParsedTransaction[]>` | Fetch and parse recent transactions for a wallet |

#### `ParsedTransaction` Type

```typescript
interface ParsedTransaction {
  signature: string;
  blockTime: number;           // Unix timestamp
  slot: number;
  success: boolean;
  fee: number;                 // Lamports
  instructions: any[];
  balanceChanges: BalanceChange[];
  summary: string;             // Human-readable: "Swapped 5 SOL for 727 USDC"
}

interface BalanceChange {
  address: string;
  token: string | null;        // null = native SOL
  tokenSymbol: string;
  before: number;
  after: number;
  change: number;
}
```

---

### 2. InstructionParser

Decodes raw Solana instructions into human-readable descriptions.

```typescript
import { InstructionParser } from '@solana-agent-sdk/core';

const parser = new InstructionParser();

// Parse a single instruction from getParsedTransaction output
const description = parser.parse(instruction);
// → "Transfer 1000000 from So111... to 9B2c..."
```

#### Protocol-Specific Parsers

These are exported functions you can use independently:

##### `parseJupiterSwap`

```typescript
import { parseJupiterSwap } from '@solana-agent-sdk/core';

const swap = parseJupiterSwap(
  instruction,      // Raw instruction
  accountKeys,      // PublicKey[]
  tokenBalanceChanges  // Map<string, { mint: string; change: number }>
);
// Returns: JupiterSwap | null
```

**`JupiterSwap` type:**

```typescript
interface JupiterSwap {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  inputSymbol?: string;    // Enriched via enrichSwapMetadata()
  outputSymbol?: string;
  slippage?: number;
  priceImpact?: number;
}
```

##### `enrichSwapMetadata`

```typescript
import { enrichSwapMetadata } from '@solana-agent-sdk/core';

const enriched = enrichSwapMetadata(swap, tokenMetadataMap);
// Adds inputSymbol, outputSymbol from token metadata
```

##### `calculatePriceImpact`

```typescript
import { calculatePriceImpact } from '@solana-agent-sdk/core';

const impact = calculatePriceImpact(
  inputAmount,   // number — units in
  outputAmount,  // number — units out
  marketPrice    // number — expected price
);
// Returns: number (percent, e.g. 0.023 = 2.3%)
```

---

### 3. Risk Detector

Multiple risk detection functions covering rug pulls, MEV exposure, portfolio concentration, and suspicious patterns.

#### 3a. Rug Pull Detection

```typescript
import { detectRugPull, isLikelyRugPull, calculateRugConfidence } from '@solana-agent-sdk/core';
import { Connection, PublicKey } from '@solana/web3.js';

const risk = await detectRugPull(connection, new PublicKey(tokenMint));

console.log(risk);
// {
//   score: 72,
//   level: 'high',
//   confidence: 0.85,
//   flags: [
//     '⚠️ Mint authority not renounced - unlimited supply possible',
//     '🚩 Top holder owns 52.3% of supply'
//   ],
//   details: { mintAuthority: true, freezeAuthority: false, topHolderPercentage: 52.3 }
// }
```

**`RugPullRisk` type:**

```typescript
interface RugPullRisk {
  score: number;                           // 0–100 (higher = more risky)
  level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;                      // 0–1 (how reliable is the score?)
  flags: string[];                         // Human-readable risk flags
  details: {
    concentration?: number;               // Holder concentration index (0–1)
    topHolderPercentage?: number;         // Largest holder's % of supply
    mintAuthority?: boolean;              // True if mint authority not renounced
    freezeAuthority?: boolean;            // True if freeze authority not renounced
    liquidity?: string;                   // Liquidity description if available
  };
}
```

**Helper functions:**

```typescript
// Quick check: is this likely a rug?
const isRug = isLikelyRugPull(risk);  // true if critical OR (high + 3+ flags)

// Get confidence breakdown with reasoning
const { confidence, reasoning } = calculateRugConfidence(risk);
```

#### 3b. MEV Exposure Detection

```typescript
import { assessMEVExposure } from '@solana-agent-sdk/core';

const mev = assessMEVExposure(parsedTransaction);

console.log(mev);
// {
//   hasJitoTip: false,
//   isPotentialSandwich: true,
//   frontrunRisk: 0.8,
//   details: ['High price impact detected: 6.20%', 'High slippage tolerance: 2.50%']
// }
```

**`MEVExposure` type:**

```typescript
interface MEVExposure {
  hasJitoTip: boolean;          // Transaction uses Jito tip (MEV-protected bundle)
  isPotentialSandwich: boolean; // Signs of sandwich attack
  frontrunRisk: number;        // 0–1 (0 = safe, 1 = very likely frontrun)
  details: string[];           // Evidence list
}
```

**Detection rules:**
- Jito tip account in instructions → `hasJitoTip = true`, `frontrunRisk = 0.1`
- Price impact > 5% → `isPotentialSandwich = true`, `frontrunRisk = 0.8`
- Slippage tolerance > 1% → `frontrunRisk = max(current, 0.6)`
- Compute Budget without Jito → `frontrunRisk = max(current, 0.4)`

#### 3c. Portfolio Risk Assessment

```typescript
import { assessPortfolioRisk } from '@solana-agent-sdk/core';

const portfolioRisk = await assessPortfolioRisk(
  connection,
  tokenBalances  // Map<string, number> — mint → amount
);

console.log(portfolioRisk);
// {
//   overallRiskScore: 45,
//   concentrationScore: 62,
//   tokenRisks: Map { 'mSoL...' => { score: 12, level: 'low', flags: [] } },
//   topHoldingsConcentration: 87,
//   stabilityScore: 0.71,
//   details: ['Top 3 tokens represent 87% of portfolio']
// }
```

**`PortfolioRiskAssessment` type:**

```typescript
interface PortfolioRiskAssessment {
  overallRiskScore: number;                        // 0–100
  concentrationScore: number;                      // 0–100 (higher = more concentrated)
  tokenRisks: Map<string, RugPullRisk>;            // Per-token risk scores
  topHoldingsConcentration: number;                // % held by top 3 tokens
  stabilityScore: number;                          // 0–1 (stability of holdings)
  details: string[];                               // Explanation strings
}
```

#### 3d. Confidence Scorer

Aggregates all risk signals into a single, actionable confidence score.

```typescript
import { ConfidenceScorer } from '@solana-agent-sdk/core';

const scorer = new ConfidenceScorer();

const score = scorer.score({
  rugPull: rugRisk,       // RugPullRisk (weight: 45%)
  portfolio: portfolioRisk, // PortfolioRiskAssessment (weight: 25%)
  mev: mevExposure,       // MEVExposure (weight: 20%)
  patterns: patternResult // PatternDetectionResult (weight: 10%)
});

// {
//   safetyScore: 74,        // 0–100 (higher = safer)
//   assessmentConfidence: 0.82,
//   recommendation: 'caution',  // 'proceed' | 'caution' | 'block' | 'insufficient_data'
//   components: { rugPull: ..., portfolio: ..., mev: ..., patterns: ... }
// }
```

---

### 4. SafeExecutor

Executes Solana transactions with built-in safety guardrails, simulation, and confirmation gates.

```typescript
import { SafeExecutor } from '@solana-agent-sdk/core';
import { Keypair } from '@solana/web3.js';

const executor = new SafeExecutor({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed',
  guardrails: {
    maxAmountSol: 10,                         // Max 10 SOL per transaction
    maxSlippageBps: 200,                      // Max 2% slippage
    blockedMints: ['SuspiciousMint...'],      // Block specific tokens
  },
  confirm: async (info) => {
    console.log(`Confirm ${info.action}:`, info.details);
    return true; // or false to cancel
  },
  logger: (msg, data) => console.log(`[exec] ${msg}`, data),
});

const payer = Keypair.fromSecretKey(/* ... */);
```

#### `Guardrails` Configuration

```typescript
interface Guardrails {
  maxAmountSol?: number;      // Max SOL amount per transaction
  maxSlippageBps?: number;    // Max slippage in basis points (100 = 1%)
  allowedMints?: string[];    // Whitelist: only these token mints allowed
  blockedMints?: string[];    // Blacklist: these mints are blocked
}
```

#### Execute a Jupiter Swap

```typescript
const result = await executor.executeSwap(jupiterQuote, payer);

// result:
// { success: true, signature: '5r7XYT...', timestamp: 1738000000 }
// { success: false, error: 'Guardrail: Slippage 3% exceeds maximum 2%', timestamp: ... }
```

**`JupiterQuote` type:**

```typescript
interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;        // lamports / token base units
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
}
```

#### Execute an SPL Transfer

```typescript
const result = await executor.executeTransfer({
  source: sourceTokenAccount,
  destination: destinationTokenAccount,
  amount: BigInt(1_000_000), // in token base units
}, payer);
```

#### Execute a Marinade Stake

```typescript
const result = await executor.executeStake({
  amount: 5 * 1e9,   // 5 SOL in lamports
  referralCode: undefined,
}, payer);
```

#### `ExecutionResult` Type

```typescript
interface ExecutionResult {
  success: boolean;
  signature?: string;   // Transaction signature (if successful)
  error?: string;       // Error message (if failed)
  timestamp: number;    // Unix timestamp of execution
}
```

**Guardrail check order:**
1. Amount limit check
2. Mint whitelist / blacklist check
3. Slippage limit check
4. Confirmation callback
5. Transaction simulation (inside protocol executor)
6. Submission

---

### 5. DecisionEngine

Multi-analyzer decision framework with weighted scoring, confidence calculation, and reasoning logs.

```typescript
import { DecisionEngine, RiskAnalyzer } from '@solana-agent-sdk/core';

const engine = new DecisionEngine();

// Register analyzers (optionally with weights)
engine.registerAnalyzer(new RiskAnalyzer(), 1.5);  // weight: 1.5

// Make a decision
const result = await engine.decide({
  type: 'yield_rebalance',
  data: {
    currentApy: 6.2,
    targetApy: 8.0,
    riskScore: 18,
  },
  context: { walletAddress: '9B2c...', timestamp: Date.now() },
});

console.log(result.decision);    // 'execute' | 'reject' | 'wait' | 'escalate'
console.log(result.reasoning);   // Array of timestamped reasoning logs
console.log(result.confidence);  // 0–1
```

#### Implementing a Custom Analyzer

```typescript
import { Analyzer, AnalysisResult } from '@solana-agent-sdk/core';

class MyYieldAnalyzer implements Analyzer {
  name = 'yield-analyzer';

  async analyze(data: any, context?: any): Promise<AnalysisResult> {
    const apyGain = data.targetApy - data.currentApy;
    const score = apyGain > 2 ? 0.9 : apyGain > 0.5 ? 0.6 : 0.3;

    return {
      score,                                    // 0–1 (1 = good, proceed)
      confidence: 0.85,                         // How sure are we?
      findings: [
        `APY improvement: +${apyGain.toFixed(1)}%`,
        score > 0.7 ? 'Recommend rebalance' : 'Hold current position',
      ],
    };
  }
}

engine.registerAnalyzer(new MyYieldAnalyzer(), 1.0);
```

#### Decision Thresholds

| Score | Confidence | Decision |
|---|---|---|
| ≥ 0.8 | ≥ 0.7 | `execute` (proceed) |
| < 0.4 | any | `reject` (block) |
| any | < 0.5 | `escalate` (human review) |
| otherwise | — | `wait` (monitor) |

#### `DecisionResult` Type

```typescript
interface DecisionResult {
  decision: 'execute' | 'reject' | 'wait' | 'escalate';
  action?: string;       // e.g., 'proceed', 'block', 'human_review'
  reasoning: string[];   // Full log of timestamped reasoning steps
  confidence: number;    // Weighted confidence from all analyzers
  metadata?: {
    score: number;       // Weighted average score (0–1)
    [analyzerName: string]: AnalysisResult;  // Per-analyzer results
  };
}
```

---

### 6. OutcomeTracker

Tracks execution outcomes to measure agent performance and enable learning loops.

```typescript
import { OutcomeTracker } from '@solana-agent-sdk/core';

const tracker = new OutcomeTracker();

// Record an outcome
tracker.record({
  decisionId: 'decision-123',
  outcome: 'success',
  executionDurationMs: 1240,
  notes: 'Swap completed, 0.8% slippage',
});
```

---

## Reference Agents

### PortfolioTrackerAgent

Monitors a wallet's holdings, calculates P&L, and flags concentration/rug risks.

```typescript
import { PortfolioTrackerAgent } from '@solana-agent-sdk/portfolio-tracker';

const agent = new PortfolioTrackerAgent(
  'https://api.mainnet-beta.solana.com'
);

// Full analysis
const report = await agent.analyzeAndReport('9B2cKm4nJhFqWvRt3YpEsLo1Xu8DbPaGdIwNkZoMp7f');

console.log(report.holdings);          // TokenHolding[]
console.log(report.riskAssessment);    // PortfolioRiskAssessment
console.log(report.alerts);           // Alert[]
console.log(report.recommendedActions); // string[]
```

**`PortfolioReport` type:**

```typescript
interface PortfolioReport {
  wallet: string;
  timestamp: number;
  holdings: TokenHolding[];
  riskAssessment: PortfolioRiskAssessment;
  alerts: Alert[];
  recentActivity: ParsedTransaction[];
  recommendedActions: string[];
}

interface TokenHolding {
  mint: string;
  symbol: string;
  amount: number;
  valueUsd: number;
  pnlPercent?: number;
  pnlUsd?: number;
  rugRiskScore?: number;  // 0–1
}
```

**Mock mode** (no RPC needed):
```typescript
const agent = new PortfolioTrackerAgent('mock://');
// → Uses pre-generated realistic transaction data
```

---

### YieldScoutAgent

Scans DeFi protocols for optimal yield opportunities and generates recommendations.

```typescript
import { YieldScoutAgent } from '@solana-agent-sdk/yield-scout';

const agent = new YieldScoutAgent({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  mockMode: false,
  minApy: 5,           // Only consider yields ≥ 5% APY
  maxRiskScore: 60,    // Only consider protocols with risk ≤ 60/100
  minTvl: 100_000,     // Only consider pools with TVL ≥ $100k
  protocols: ['marinade', 'orca', 'raydium', 'marginfi', 'kamino'],
});

const report = await agent.scout(walletAddress);
agent.printReport(report);
```

**`YieldScoutReport` type:**

```typescript
interface YieldScoutReport {
  wallet: string;
  timestamp: Date;
  topOpportunities: YieldOpportunity[];
  totalOpportunitiesScanned: number;
  currentPositions: WalletYieldPosition[];
  summary: {
    bestApy: number;
    bestPool: string;
    bestProtocol: string;
    averageMarketApy: number;
    walletCurrentApy: number;
    potentialGainUsd: number;
  };
  recommendations: YieldRecommendation[];
  agentDecisions: DecisionLogEntry[];
}

interface YieldOpportunity {
  protocol: string;
  poolName: string;
  totalApy: number;
  baseApy: number;
  rewardApy: number;
  tvl: number;             // USD
  riskScore: number;       // 0–100
  riskAdjustedApy: number; // APY / (riskScore / 100)
  poolAddress: string;
  tokens: string[];
  auditedBy: string[];
  lastUpdated: Date;
}
```

---

### RiskMonitorAgent

Continuously monitors for security threats: rug pulls, MEV attacks, phishing, protocol exploits.

```typescript
import { RiskMonitorAgent, ContinuousRiskMonitor } from '@solana-agent-sdk/risk-monitor';

const agent = new RiskMonitorAgent({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  mockMode: false,
  minThreatLevel: 'medium',     // Only report medium+ threats
  maxRiskScore: 50,
  checkWallet: true,
  checkProtocols: true,
  checkTokens: true,
  enableAutoMitigation: false,  // Never auto-move funds (default: false)
});

// One-off report
const report = await agent.monitor(walletAddress);
agent.printReport(report);

// Continuous monitoring (every 5 minutes)
const monitor = new ContinuousRiskMonitor(config, 5 * 60 * 1000);
await monitor.start(walletAddress, (report) => {
  console.log('New threats detected!', report.threats);
});
```

**`ThreatSignal` type:**

```typescript
interface ThreatSignal {
  category: 'rug_pull' | 'mev_attack' | 'phishing' | 'protocol_exploit' | 'honeypot' | 'flash_loan';
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;            // 0–1
  triggerAddress?: string;
  triggerType?: 'token' | 'transaction' | 'protocol';
  estimatedLossUsd?: number;
  recommendedAction: string;
  autoMitigationAvailable: boolean;
  resolved: boolean;
}
```

---

## TypeScript Types Reference

```typescript
// Core types
export type Commitment = 'processed' | 'confirmed' | 'finalized';
export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Analyzer interface
export interface Analyzer {
  name: string;
  analyze(data: any, context?: any): Promise<AnalysisResult>;
}

export interface AnalysisResult {
  score: number;        // 0–1
  confidence: number;   // 0–1
  findings: string[];
}

// Decision types
export interface DecisionRequest {
  type: string;
  data: any;
  context?: any;
}

export type DecisionVerdict = 'execute' | 'reject' | 'wait' | 'escalate';
```

---

## Configuration Examples

### Minimum (Read-Only Analysis)

```typescript
const sdk = new SolanaAgentSDK({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
});
// ✅ Can parse, analyze, detect risks
// ❌ Cannot execute (no keypair)
```

### Conservative (Confirmation Required)

```typescript
const sdk = new SolanaAgentSDK({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  guardrails: {
    maxAmountSol: 1,
    maxSlippageBps: 100,  // 1%
  },
  confirm: async ({ action, details }) => {
    // Always require human approval
    return await promptUser(`Approve ${action}?`, details);
  },
});
```

### Autonomous (Agent Mode)

```typescript
const sdk = new SolanaAgentSDK({
  rpcUrl: process.env.SOLANA_RPC_URL!,
  guardrails: {
    maxAmountSol: 5,
    maxSlippageBps: 150,  // 1.5%
    allowedMints: [SOL_MINT, USDC_MINT, MSOL_MINT],
  },
  // No confirm callback → auto-approve within guardrails
});
```

---

## Error Handling

All async methods return structured results rather than throwing (except on network failures):

```typescript
const result = await executor.executeSwap(quote, payer);

if (!result.success) {
  switch (true) {
    case result.error?.includes('Guardrail'):
      console.log('Safety limit triggered:', result.error);
      break;
    case result.error?.includes('User denied'):
      console.log('User cancelled execution');
      break;
    default:
      console.error('Execution failed:', result.error);
  }
}
```

---

## See Also

- [Quick-start Guide](./quickstart.md) — 5-minute getting started
- [build-log.md](../build-log.md) — Agent decision log and architecture decisions
- [GitHub Repository](https://github.com/fffwaves/superteam) — Full source code
