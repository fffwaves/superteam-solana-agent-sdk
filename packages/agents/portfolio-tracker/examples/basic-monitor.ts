import { PortfolioTrackerAgent } from "../src/index";
import { PortfolioMonitor } from "../src/monitor";

async function main() {
  // Initialize agent in mock mode for demonstration
  const agent = new PortfolioTrackerAgent("mock-rpc-url");
  
  const walletAddress = "vines1vzrY7Za8otAy9Yz2Mn98i39GzRXPn9C7zY9"; // Example address

  const monitor = new PortfolioMonitor(agent, {
    intervalMs: 10000, // 10 seconds for demo
    onReport: (report) => {
      console.log("\n--- PORTFOLIO REPORT ---");
      console.log(`Wallet: ${report.wallet}`);
      console.log(`Holdings: ${report.holdings.length}`);
      
      report.holdings.forEach(h => {
        console.log(`- ${h.symbol}: ${h.amount.toFixed(2)} (Value: ${h.totalValueSol.toFixed(4)} SOL, P&L: ${h.unrealizedPnLPercent.toFixed(2)}%)`);
      });

      console.log(`\nRisk Score: ${report.riskAssessment.overallRiskScore.toFixed(1)}/100`);
      
      if (report.alerts.length > 0) {
        console.log("\nALERTS:");
        report.alerts.forEach(a => console.log(`[${a.level.toUpperCase()}] ${a.message}`));
      }

      console.log("\nRECOMMENDATIONS:");
      report.recommendedActions.forEach(ra => console.log(`- ${ra}`));
      console.log("------------------------\n");
    }
  });

  // Start monitoring
  await monitor.start(walletAddress);

  // Stop after 25 seconds (2 runs)
  setTimeout(() => {
    monitor.stop();
    process.exit(0);
  }, 25000);
}

main().catch(console.error);
