/**
 * Risk Monitor Agent — Basic Example
 * 
 * Demonstrates the RiskMonitorAgent scanning a wallet for threats,
 * checking protocol health, and generating prioritized security alerts.
 * 
 * Run: npx ts-node src/examples/basic-monitor.ts
 */

import { RiskMonitorAgent } from "../index";

async function main() {
  console.log("═".repeat(60));
  console.log("  RISK MONITOR AGENT — Solana Agent SDK Demo");
  console.log("═".repeat(60));
  console.log();

  // Initialize agent in mock mode (no real wallet/RPC needed)
  const agent = new RiskMonitorAgent({
    mockMode: true,
    minThreatLevel: "medium",     // Report medium and above
    checkWallet: true,
    checkProtocols: true,
    checkTokens: true,
    enableAutoMitigation: false,  // Require user confirmation for any action
  });

  // Example wallet (replace with real wallet for live mode)
  const wallet = "demo-wallet-7tFm2v8KLsYE9XB3NpV4";

  // Run full risk assessment
  const report = await agent.monitor(wallet);

  // Print formatted report
  agent.printReport(report);

  // Show agent decision reasoning
  console.log("🧠 AGENT DECISION LOG");
  console.log("─".repeat(60));
  report.agentDecisions.forEach(decision => {
    console.log(`\n[${decision.check}] confidence=${(decision.confidence * 100).toFixed(0)}%`);
    console.log(`  Finding: ${decision.finding}`);
    console.log(`  Action:  ${decision.action}`);
  });

  console.log("\n\n✅ Monitor complete. In live mode, the agent can:");
  console.log("   • Monitor continuously (ContinuousRiskMonitor, default 5-minute intervals)");
  console.log("   • Alert via callback when new threats are detected");
  console.log("   • Auto-revoke token approvals (with enableAutoMitigation: true + user permission)");
  console.log("   • Integrate with Portfolio Tracker for correlated risk assessment");
}

main().catch(console.error);
