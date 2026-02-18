# Quickstart — Solana Agent SDK

> Get up and running in 5 minutes.

---

## Prerequisites

- Node.js 20+
- TypeScript 5.x (optional but recommended)
- A Solana RPC endpoint (free options: Helius, QuickNode, or `api.mainnet-beta.solana.com`)

---

## Step 1: Install

```bash
npm install @solana-agent-sdk/core
```

For the reference agents (optional):

```bash
npm install @solana-agent-sdk/portfolio-tracker
npm install @solana-agent-sdk/yield-scout
npm install @solana-agent-sdk/risk-monitor
```

---

## Step 2: Initialize the SDK

```typescript
import { SolanaAgentSDK } from '@solana-agent-sdk/core';

const sdk = new SolanaAgentSDK({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed',
});

console.log('SDK initialized ✓');
```

You now have access to `sdk.fetcher`, `sdk.parser`, `sdk.executor`, and `sdk.decisionEngine`.

---

## Step 3: Parse a Transaction

Fetch and parse recent transactions for any wallet address:

```typescript
const walletAddress = '9B2cKm4nJhFqWvRt3YpEsLo1Xu8DbPaGdIwNkZoMp7f';

// Fetch last 10 transactions
const transactions = await sdk.fetcher.fetchAllTransactions(walletAddress, 10);

// Each transaction has a human-readable summary
for (const tx of transactions) {
  console.log(`[${tx.success ? '✓' : '✗'}] ${tx.summary}`);
  console.log(`    Fee: ${tx.fee} lamports · Slot: ${tx.slot}`);

  for (const change of tx.balanceChanges) {
    const sign = change.change > 0 ? '+' : '';
    console.log(`    ${change.tokenSymbol}: ${sign}${change.change}`);
  }
}
```

**Example output:**
```
[✓] Swapped 5 SOL for 727.35 USDC via Jupiter
    Fee: 25000 lamports · Slot: 312847293
    SOL: -5
    USDC: +727.35

[✓] Staked 10 SOL → 9.78 mSOL via Marinade
    Fee: 15000 lamports · Slot: 312838102
    SOL: -10
    mSOL: +9.78
```

---

## Step 4: Check Risks

Assess rug pull risk for any token mint address:

```typescript
import { detectRugPull, assessMEVExposure, isLikelyRugPull } from '@solana-agent-sdk/core';
import { PublicKey } from '@solana/web3.js';

const tokenMint = new PublicKey('SomeTokenMintAddressHere...');

// Check rug pull risk
const rugRisk = await detectRugPull(sdk.connection, tokenMint);

console.log(`Risk Level: ${rugRisk.level} (Score: ${rugRisk.score}/100)`);
console.log(`Confidence: ${(rugRisk.confidence * 100).toFixed(0)}%`);
console.log('Flags:');
rugRisk.flags.forEach(flag => console.log(`  ${flag}`));

if (isLikelyRugPull(rugRisk)) {
  console.log('⚠️  HIGH RISK — Do not invest!');
}
```

**Example output:**
```
Risk Level: high (Score: 72/100)
Confidence: 85%
Flags:
  ⚠️ Mint authority not renounced - unlimited supply possible
  🚩 Top holder owns 52.3% of supply
⚠️  HIGH RISK — Do not invest!
```

Check MEV exposure on a transaction:

```typescript
const tx = transactions[0]; // From Step 3
const mev = assessMEVExposure(tx);

console.log(`MEV Frontrun Risk: ${(mev.frontrunRisk * 100).toFixed(0)}%`);
console.log(`Potential Sandwich: ${mev.isPotentialSandwich}`);
console.log(`Jito Protected: ${mev.hasJitoTip}`);
mev.details.forEach(d => console.log(`  • ${d}`));
```

---

## Step 5: Run a Reference Agent

The easiest way to see everything working together is to run a reference agent:

### Portfolio Tracker

```typescript
import { PortfolioTrackerAgent } from '@solana-agent-sdk/portfolio-tracker';

const agent = new PortfolioTrackerAgent(
  'https://api.mainnet-beta.solana.com'
  // Pass 'mock://' to use generated data (no RPC needed)
);

const report = await agent.analyzeAndReport(walletAddress);

console.log('\n=== PORTFOLIO REPORT ===');
console.log(`Wallet: ${report.wallet}`);
console.log(`\nHoldings (${report.holdings.length} tokens):`);
for (const h of report.holdings) {
  console.log(`  ${h.symbol}: ${h.amount.toFixed(4)} (Rug Risk: ${((h.rugRiskScore ?? 0) * 100).toFixed(0)}%)`);
}
console.log(`\nRisk Score: ${report.riskAssessment.overallRiskScore}/100`);
console.log(`Concentration: ${report.riskAssessment.concentrationScore}/100`);
console.log(`\nAlerts (${report.alerts.length}):`);
report.alerts.forEach(a => console.log(`  [${a.level}] ${a.message}`));
console.log('\nRecommended Actions:');
report.recommendedActions.forEach(a => console.log(`  • ${a}`));
```

### Yield Scout

```typescript
import { YieldScoutAgent } from '@solana-agent-sdk/yield-scout';

const scout = new YieldScoutAgent({
  mockMode: true,   // No RPC needed for demo
  minApy: 5,
  maxRiskScore: 60,
});

const report = await scout.scout(walletAddress);
scout.printReport(report);
```

**Example output:**
```
────────────────────────────────────────────────────────────
🔭 YIELD SCOUT REPORT
   Wallet: 9B2c…Mp7f
   Time:   2026-02-18T06:00:00.000Z
────────────────────────────────────────────────────────────

📊 MARKET SUMMARY
   Best APY:         8.0% (mSOL Native Staking)
   Avg Market APY:   6.4%
   Your Current APY: 7.8%
   30-day Potential: +$9.40 if rebalanced

🏆 TOP OPPORTUNITIES (Risk-Adjusted)
   1. [🟢 LOW] mSOL Native Staking (MARINADE)
      APY: 8.0% | TVL: $1250M | Risk: 10/100
   2. [🟢 LOW] USDC Lending (MARGINFI)
      APY: 7.2% | TVL: $280M | Risk: 15/100
   ...
```

### Risk Monitor

```typescript
import { RiskMonitorAgent } from '@solana-agent-sdk/risk-monitor';

const monitor = new RiskMonitorAgent({ mockMode: true });
const report = await monitor.monitor(walletAddress);
monitor.printReport(report);
```

---

## Next Steps

- **API Reference** — Full documentation for all methods: [`docs/api.md`](./api.md)
- **Dashboard** — Run the visualization UI: `cd packages/dashboard && npm install && npm run dev`
- **Custom Analyzers** — Add your own decision logic to the `DecisionEngine`
- **Live Mode** — Remove `mockMode` and pass your Helius/QuickNode RPC URL for real on-chain data

---

## Quick Reference

| Task | Code |
|---|---|
| Parse transaction | `sdk.fetcher.fetchAllTransactions(wallet, 10)` |
| Check rug pull | `detectRugPull(sdk.connection, tokenMint)` |
| Assess MEV | `assessMEVExposure(transaction)` |
| Portfolio risk | `assessPortfolioRisk(connection, balances)` |
| Safe swap | `sdk.executor.executeSwap(jupiterQuote, payer)` |
| AI decision | `sdk.decisionEngine.decide({ type, data })` |
| Run agent | `new PortfolioTrackerAgent(rpcUrl).analyzeAndReport(wallet)` |

---

## Common Issues

**`Connection refused` on RPC** → Use a rate-limited endpoint like Helius (free tier):
```bash
SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

**Token metadata not found** → Some new tokens don't have on-chain metadata. The SDK returns `confidence: 0.2` in this case rather than erroring.

**Typescript errors** → Set `"strict": false` in tsconfig.json or use the SDK as a CommonJS module (`const { SolanaAgentSDK } = require(...)`).
