# Risk Monitor Agent

A reference agent for the Solana Agent SDK that autonomously monitors wallets and DeFi protocols for security threats — including rug pulls, MEV attacks, phishing, and protocol exploits.

## What It Does

- **Wallet threat scanning** — detects suspicious token approvals, unusual activity patterns
- **Token risk analysis** — rug pull scoring, mint authority checks, liquidity lock analysis
- **MEV detection** — identifies sandwich attacks and frontrunning in transaction history
- **Protocol health monitoring** — tracks TVL changes and exploit signals across 5 protocols
- **Continuous alerting** — `ContinuousRiskMonitor` fires callbacks when new threats emerge

## Quick Start

```bash
npm install
npx ts-node src/examples/basic-monitor.ts
```

## Usage

```typescript
import { RiskMonitorAgent } from "@solana-agent-sdk/risk-monitor";

const agent = new RiskMonitorAgent({
  mockMode: true,             // false = live RPC
  minThreatLevel: "medium",   // Report medium+ threats
  checkWallet: true,
  checkProtocols: true,
  enableAutoMitigation: false, // Require confirmation for all actions
});

const report = await agent.monitor("YourWalletAddress");
agent.printReport(report);
```

## Continuous Monitoring

```typescript
import { ContinuousRiskMonitor } from "@solana-agent-sdk/risk-monitor";

const monitor = new ContinuousRiskMonitor({ mockMode: false }, 5 * 60 * 1000); // every 5 min
await monitor.start("YourWalletAddress", (report) => {
  if (report.summary.overallStatus === "critical") {
    // Send alert, execute mitigation, etc.
    console.log("🚨 CRITICAL THREAT:", report.summary.topThreat?.title);
  }
});
```

## Threat Categories

| Category           | Severity | Description |
|--------------------|----------|-------------|
| `rug_pull`         | HIGH     | Creator dumps, liquidity removal, mint abuse |
| `mev_attack`       | MEDIUM   | Sandwich attacks, frontrunning |
| `phishing`         | MEDIUM   | Suspicious token approvals |
| `wallet_drain`     | CRITICAL | Unauthorized spend authority |
| `flash_loan`       | HIGH     | Multi-step attack patterns |
| `exploit`          | CRITICAL | Known protocol vulnerabilities |
| `suspicious_mint`  | MEDIUM   | Abnormal mint authority activity |

## Integration with Portfolio Tracker

The Risk Monitor is designed to work alongside the Portfolio Tracker:

```typescript
import { PortfolioTrackerAgent } from "@solana-agent-sdk/portfolio-tracker";
import { RiskMonitorAgent } from "@solana-agent-sdk/risk-monitor";

const portfolio = await tracker.analyzeAndReport(wallet);
const risks = await monitor.monitor(wallet);

// Cross-reference: which holdings have active threats?
const riskyHoldings = portfolio.holdings.filter(h =>
  risks.threats.some(t => t.triggerAddress === h.mint)
);
```

## Agent Reasoning

Every monitor run produces a full `agentDecisions` log explaining:
- What was checked and why
- Confidence scores per threat
- Whether auto-mitigation was considered
