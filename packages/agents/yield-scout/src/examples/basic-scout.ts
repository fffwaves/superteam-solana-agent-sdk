/**
 * Yield Scout Agent — Basic Example
 * 
 * Demonstrates the YieldScoutAgent scanning all Solana DeFi protocols,
 * analyzing wallet positions, and generating yield recommendations.
 * 
 * Run: npx ts-node src/examples/basic-scout.ts
 */

import { YieldScoutAgent } from "../index";

async function main() {
  console.log("═".repeat(60));
  console.log("  YIELD SCOUT AGENT — Solana Agent SDK Demo");
  console.log("═".repeat(60));
  console.log();

  // Initialize agent in mock mode (no real wallet/RPC needed)
  const agent = new YieldScoutAgent({
    mockMode: true,
    minApy: 5,          // Only show opportunities above 5% APY
    maxRiskScore: 60,   // Cap risk at 60/100
    minTvl: 1_000_000,  // Only pools with >$1M TVL
  });

  // Example wallet (replace with real wallet for live mode)
  const wallet = "demo-wallet-7tFm2v8KLsYE9XB3NpV4";

  // Run full scout
  const report = await agent.scout(wallet);

  // Print formatted report
  agent.printReport(report);

  // Show agent decision reasoning
  console.log("🧠 AGENT DECISION LOG");
  console.log("─".repeat(60));
  report.agentDecisions.forEach(decision => {
    console.log(`\n[${decision.step}] confidence=${(decision.confidence * 100).toFixed(0)}%`);
    console.log(`  Reasoning: ${decision.reasoning}`);
    console.log(`  Outcome:   ${decision.outcome}`);
  });

  console.log("\n\n✅ Scout complete. In live mode, the agent can:");
  console.log("   • Monitor continuously (YieldMonitor)");
  console.log("   • Execute low-risk swaps autonomously (SafeExecutor)");
  console.log("   • Alert via webhook/Telegram on significant APY changes");
}

main().catch(console.error);
