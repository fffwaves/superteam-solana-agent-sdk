# Solana Agent SDK

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Solana](https://img.shields.io/badge/Solana-mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com/)
[![Superteam](https://img.shields.io/badge/Superteam-Open%20Innovation%20Track-14F195)](https://superteam.fun/earn/listing/open-innovation-track-agents/)

> *A TypeScript framework for AI agents to autonomously understand, analyze, and interact with Solana.*

Built autonomously by **WavesAI** for the [Superteam Open Innovation Track](https://superteam.fun/earn/listing/open-innovation-track-agents/).

---

## The Problem

Consumers increasingly use AI agents to navigate cryptocurrency. But agents struggle on Solana because:

- **Transactions are cryptic** — What actually happened? Did I get rugged?
- **Risks are hidden** — Is this token safe? How much did MEV cost me?
- **Execution is unsafe** — Agents can't autonomously make smart swaps without guardrails
- **No agent-first tools exist** — SDKs are built for humans, not AI

---

## The Solution

**Solana Agent SDK** provides modular, agent-friendly tools:

### 1. **Transaction Parser**
Parse any Solana transaction and explain what happened in plain language:
```typescript
const txs = await sdk.fetcher.fetchAllTransactions(walletAddress, 10);
// → "Swapped 5 SOL for 727.35 USDC via Jupiter"
// → "Staked 10 SOL → 9.78 mSOL via Marinade"
```

### 2. **Risk Detector**
Identify dangers before they happen:
```typescript
const risk = await detectRugPull(sdk.connection, tokenMint);
// → score: 72, level: 'high', confidence: 0.85
// → flags: ['Mint authority not renounced', 'Top holder owns 52.3%']

const mev = assessMEVExposure(tx);
// → frontrunRisk: 0.8, isPotentialSandwich: true
```

### 3. **Safe Executor**
Execute swaps with guardrails:
```typescript
const result = await sdk.executor.executeSwap(jupiterQuote, payer);
// → Runs guardrail checks → simulation → confirm callback → submit
// → result: { success: true, signature: '5r7XYT...' }
```

### 4. **Decision Framework**
Structure agent reasoning with pluggable analyzers and full reasoning logs:
```typescript
const decision = await sdk.decisionEngine.decide({
  type: 'yield_rebalance',
  data: { currentApy: 6.2, targetApy: 8.0, riskScore: 18 },
});
// → decision: 'execute', confidence: 0.87
// → reasoning: ['APY improvement +1.8%', 'Risk within threshold', ...]
```

---

## Reference Agents (Live Examples)

This SDK includes 3 autonomous reference agents that demonstrate the full agent loop:

### Portfolio Tracker Agent
Monitors wallet holdings, calculates P&L, flags risks.

```typescript
import { PortfolioTrackerAgent } from '@solana-agent-sdk/portfolio-tracker';

const agent = new PortfolioTrackerAgent('https://api.mainnet-beta.solana.com');
const report = await agent.analyzeAndReport('9B2cKm4n...');

// report.holdings  → TokenHolding[] with P&L and rug risk scores
// report.alerts    → Concentration warnings, rug pull alerts
// report.recommendedActions → ["Diversify: mSOL at 35% approaching 40% threshold"]
```

### Yield Scout Agent
Monitors DeFi protocols, recommends optimal yield strategies.

```typescript
import { YieldScoutAgent } from '@solana-agent-sdk/yield-scout';

const scout = new YieldScoutAgent({ mockMode: true, minApy: 5 });
const report = await scout.scout(walletAddress);
scout.printReport(report);
// Best APY: 8.0% at mSOL Native Staking (Marinade)
// Recommendation: Enter mSOL Native Staking (+1.8pp improvement)
```

### Risk Monitor Agent
Watches for exploits, rug pulls, suspicious behavior — continuously.

```typescript
import { ContinuousRiskMonitor } from '@solana-agent-sdk/risk-monitor';

const monitor = new ContinuousRiskMonitor({ mockMode: true }, 5 * 60 * 1000);
await monitor.start(walletAddress, (report) => {
  console.log(`🚨 ${report.threats.length} new threats detected`);
  report.immediateActions.forEach(a => console.log(a));
});
```

---

## Architecture

```
solana-agent-sdk/
├── packages/
│   ├── core/                    # SDK core — 4 modules
│   │   ├── src/parser/          # Jupiter, Marinade, Orca, SPL instruction decoders
│   │   ├── src/risk/            # Rug detector, MEV detector, portfolio risk, confidence scorer
│   │   ├── src/executor/        # SafeExecutor, SPL/Jupiter/Marinade executors, simulator
│   │   └── src/decision/        # DecisionEngine, RiskAnalyzer, OutcomeTracker
│   ├── agents/
│   │   ├── portfolio-tracker/   # P&L tracker, risk monitor, alert generator
│   │   ├── yield-scout/         # Protocol scanner, yield recommender, monitor loop
│   │   └── risk-monitor/        # Threat detector, protocol health, continuous monitor
│   └── dashboard/               # Next.js 15 live agent visualization UI
├── docs/
│   ├── api.md                   # Full API reference
│   ├── quickstart.md            # 5-minute getting started guide
│   └── prd-superteam.md        # Product requirements document
├── TASKS.md                     # Sprint progress
├── BACKLOG.md                   # Feature backlog by tier
└── build-log.md                 # Agent decision log
```

---

## Getting Started

### Install

```bash
npm install @solana-agent-sdk/core
```

### Minimal Example

```typescript
import { SolanaAgentSDK, detectRugPull } from '@solana-agent-sdk/core';
import { PublicKey } from '@solana/web3.js';

const sdk = new SolanaAgentSDK({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
});

// 1. Parse recent transactions
const txs = await sdk.fetcher.fetchAllTransactions('9B2cKm4n...', 10);
console.log(txs[0].summary); // "Swapped 5 SOL for 727.35 USDC via Jupiter"

// 2. Detect rug pull risk
const risk = await detectRugPull(sdk.connection, new PublicKey('TokenMint...'));
console.log(`${risk.level} risk (${risk.score}/100)`);

// 3. Make a decision
sdk.setupRiskAnalyzer();
const decision = await sdk.decisionEngine.decide({
  type: 'swap_evaluation',
  data: { riskScore: risk.score, confidence: risk.confidence },
});
console.log(decision.decision); // 'execute' | 'reject' | 'wait' | 'escalate'
```

### Run the Dashboard

```bash
cd packages/dashboard
npm install
npm run dev
# → http://localhost:3000
```

### Run the Portfolio Tracker (Mock Mode)

```bash
cd packages/agents/portfolio-tracker
npm install
npx ts-node examples/basic-monitor.ts
```

### Run in Mock Mode (No RPC Needed)

All agents support `mockMode: true` for immediate demo without a live RPC:

```typescript
const agent = new PortfolioTrackerAgent('mock://');
const report = await agent.analyzeAndReport('any-wallet-address');
// → Returns realistic generated data
```

---

## How It Demonstrates Agent Autonomy

1. **Planning** — Agent independently designed architecture, scoped features, prioritized by tier
2. **Execution** — Agent built entire SDK with own decisions on patterns, APIs, and tradeoffs
3. **Risk awareness** — Agents check risks before every action; never execute without guardrail pass
4. **Reasoning logs** — Every decision logged with "why" (`build-log.md`, `DecisionEngine.reasoning`)
5. **Learning** — `OutcomeTracker` records success/failure for each execution to improve future decisions
6. **Iteration** — Agent tested, found issues (symlink resolution, confidence scoring edge cases), fixed autonomously

See [`build-log.md`](./build-log.md) for the full 4-session decision log.

---

## Meaningful Solana Integration

| Feature | Implementation |
|---|---|
| **Jupiter swap parsing** | Decodes balance change maps to infer input/output amounts |
| **Marinade stake tracking** | Parses `liquid_stake` / `liquid_unstake` program instructions |
| **Orca liquidity** | Detects add/remove liquidity from balance changes |
| **Rug pull detection** | Checks mint authority, freeze authority, top holder concentration |
| **MEV detection** | Identifies Jito tip accounts, high slippage, compute budget patterns |
| **Safe execution** | Simulates before submitting; enforces amount caps and slippage limits |
| **Decision framework** | Weighted multi-analyzer scoring with confidence bounds |

---

## Dashboard

The included Next.js dashboard visualizes agent activity in real-time:

- **Agent Status Cards** — Live status, last decision, confidence score, run statistics
- **Transaction History** — Parsed transactions with type, protocol, amounts, and status
- **Portfolio Overview** — Holdings with allocation bars, 24h P&L, APY
- **Risk Assessment Panel** — Risk scores per dimension, active alerts with recommended actions

**Run locally:**
```bash
cd packages/dashboard && npm install && npm run dev
```

**Live demo:** https://superteam-agents.vercel.app

---

## Evaluation Criteria Alignment

| Criterion | How We Win |
|---|---|
| **Degree of agent autonomy** | Agent designed architecture, made decisions, iterated independently. Full log in build-log.md |
| **Originality & creativity** | First agent-first SDK for Solana. Novel agent-chain interaction patterns with weighted decision engines |
| **Quality of execution** | Polished, TypeScript-typed, tested. Clear API docs, quickstart, live dashboard |
| **Meaningful Solana use** | Deep protocol parsing (Jupiter, Marinade, Orca), program introspection, safe on-chain execution |
| **Clarity & reproducibility** | Full open-source repo (MIT), one-command setup, mock mode for instant demo |

---

## Timeline

| Phase | Duration | Completed |
|---|---|---|
| Research + Design | Days 1–2 | ✅ Feb 11–12 |
| Core SDK | Days 3–6 | ✅ Feb 12–16 |
| Reference Agents | Days 7–9 | ✅ Feb 17–18 |
| Dashboard | Day 10 | ✅ Feb 18 |
| Docs + Polish | Days 11–12 | ✅ Feb 18 |

**Total: ~8 days active development (Feb 11 – Feb 18, 2026)**

---

## Tech Stack

- **Language:** TypeScript 5.x
- **Runtime:** Node.js 20+
- **Solana:** `@solana/web3.js`, SPL Token, Anchor.js 0.29
- **Frontend:** Next.js 15 (App Router), shadcn/ui, TailwindCSS
- **License:** MIT

---

## Documentation

- **[Quickstart Guide](./docs/quickstart.md)** — Up and running in 5 minutes
- **[API Reference](./docs/api.md)** — Full method signatures and types
- **[Build Log](./build-log.md)** — Agent decision log and architecture rationale
- **[PRD](./docs/prd-superteam.md)** — Product requirements and evaluation alignment

---

## Submission Details

**Superteam Open Innovation Track**
- Prize: $5,000 USDG
- Deadline: March 1, 2026
- Requirements: Open source (MIT/Apache 2.0), autonomous agent, meaningful Solana use
- GitHub: [fffwaves/superteam](https://github.com/fffwaves/superteam)

---

## License

MIT — See [LICENSE](./LICENSE) file

---

**Built autonomously by WavesAI**  
Started: Feb 11, 2026 · Status: ✅ Complete
