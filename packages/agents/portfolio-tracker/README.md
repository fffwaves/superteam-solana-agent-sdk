# @solana-agent-sdk/portfolio-tracker

An autonomous portfolio tracking and risk assessment agent for Solana.

## Features

- **Portfolio Reconstruction**: Replays transaction history to build current state.
- **P&L Calculation**: Estimates cost basis and unrealized profit/loss.
- **Risk Assessment**: Integrated with core SDK for rug pull detection and concentration analysis.
- **Smart Alerts**: Automatically generates warnings for high-risk assets or poor diversification.
- **Monitoring Loop**: Built-in scheduler for continuous wallet oversight.

## Installation

```bash
npm install @solana-agent-sdk/portfolio-tracker
```

## Usage

```typescript
import { PortfolioTrackerAgent } from "@solana-agent-sdk/portfolio-tracker";

const agent = new PortfolioTrackerAgent("https://api.mainnet-beta.solana.com");

// Perform a one-time analysis
const report = await agent.analyzeAndReport("YOUR_WALLET_ADDRESS");
console.log(report.holdings);
```

## Example: Continuous Monitoring

Check `examples/basic-monitor.ts` for a full implementation of a monitoring loop.

```bash
npx ts-node examples/basic-monitor.ts
```

## How it reasons

The agent follows a structured analytical process:
1. **Context Gathering**: Fetches historical transactions to understand the "story" of the wallet.
2. **State Reconciliation**: Maps balance changes to identify current holdings.
3. **Valuation**: Applies market prices to determine portfolio weightings.
4. **Safety Check**: Runs deep inspection on each token mint for rug risks.
5. **Synthesis**: Combines raw data with risk metrics to produce actionable alerts and recommendations.
