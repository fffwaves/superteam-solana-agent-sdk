import { PortfolioTrackerAgent } from "./index";
import { PortfolioReport } from "./types";

export interface MonitorOptions {
  intervalMs: number;
  onReport: (report: PortfolioReport) => void;
  onError?: (error: any) => void;
}

export class PortfolioMonitor {
  private agent: PortfolioTrackerAgent;
  private options: MonitorOptions;
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(agent: PortfolioTrackerAgent, options: MonitorOptions) {
    this.agent = agent;
    this.options = options;
  }

  async start(walletAddress: string) {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log(`[Monitor] Starting portfolio monitoring for ${walletAddress}`);
    
    const run = async () => {
      try {
        console.log(`[Monitor] Running scheduled analysis...`);
        const report = await this.agent.analyzeAndReport(walletAddress);
        this.options.onReport(report);
      } catch (error) {
        console.error(`[Monitor] Error during analysis:`, error);
        if (this.options.onError) this.options.onError(error);
      }
      
      if (this.isRunning) {
        this.timer = setTimeout(run, this.options.intervalMs);
      }
    };

    await run();
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log(`[Monitor] Stopped monitoring.`);
  }
}
