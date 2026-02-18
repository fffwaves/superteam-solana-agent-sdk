# Yield Scout Agent

A reference agent for the Solana Agent SDK that autonomously monitors DeFi yields across Solana protocols and recommends optimal yield strategies.

## What It Does

- **Scans 5+ protocols** — Marinade, Orca, Raydium, marginfi, Kamino
- **Risk-adjusted ranking** — ranks opportunities by APY per unit of risk
- **Wallet position analysis** — detects your current yield positions from transaction history
- **Actionable recommendations** — ENTER, REBALANCE, MONITOR, or EXIT signals
- **Continuous monitoring** — `YieldMonitor` runs scans on a schedule and fires alerts on significant changes

## Quick Start

```bash
npm install
npx ts-node src/examples/basic-scout.ts
```

## Usage

```typescript
import { YieldScoutAgent } from "@solana-agent-sdk/yield-scout";

const agent = new YieldScoutAgent({
  mockMode: true,       // false = live RPC
  minApy: 5,            // Only show >5% APY
  maxRiskScore: 60,     // Cap risk at 60/100
  minTvl: 1_000_000,   // Only pools with >$1M TVL
});

const report = await agent.scout("YourWalletAddress");
agent.printReport(report);
```

## Continuous Monitoring

```typescript
import { YieldMonitor } from "@solana-agent-sdk/yield-scout";

const monitor = new YieldMonitor({ mockMode: false }, 60 * 60 * 1000); // hourly
await monitor.start("YourWalletAddress", (report) => {
  console.log("New yield report:", report.summary);
});
```

## Protocols Covered

| Protocol  | Type              | Risk Level |
|-----------|-------------------|------------|
| Marinade  | Liquid Staking    | 🟢 Low    |
| marginfi  | Lending           | 🟢 Low    |
| Orca      | Whirlpools (CLMM) | 🟡 Medium |
| Kamino    | Automated Vaults  | 🟡 Medium |
| Raydium   | AMM + Farms       | 🟡 Medium |

## Agent Reasoning

Every scout run produces a full `agentDecisions` log explaining:
- Why each opportunity was included/excluded
- How recommendations were prioritized
- Confidence scores for each decision

## In Live Mode

Set `mockMode: false` and provide a real RPC URL to:
- Fetch actual on-chain APY data from protocol APIs
- Detect real wallet positions from transaction history
- Execute approved swaps via `SafeExecutor` (with confirmation flow)
