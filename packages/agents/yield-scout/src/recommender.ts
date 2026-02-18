/**
 * YieldRecommender — Decision-making layer for Yield Scout
 * 
 * Takes scanned opportunities + wallet positions and generates
 * actionable, prioritized recommendations using the agent's
 * decision framework.
 */

import {
  YieldOpportunity,
  WalletYieldPosition,
  YieldRecommendation,
  AgentDecisionLog,
  YieldSummary,
} from "./types";

export class YieldRecommender {
  private decisions: AgentDecisionLog[] = [];

  /**
   * Main entry: analyze opportunities and wallet positions,
   * return prioritized recommendations with reasoning.
   */
  generateRecommendations(
    opportunities: YieldOpportunity[],
    positions: WalletYieldPosition[]
  ): YieldRecommendation[] {
    this.decisions = [];
    const recommendations: YieldRecommendation[] = [];

    this.log(
      "Market Analysis",
      `Evaluating ${opportunities.length} yield opportunities against ${positions.length} current positions`,
      "Proceeding with risk-adjusted APY comparison",
      0.95
    );

    // 1. Recommend top opportunities for new capital
    const top3 = opportunities.slice(0, 3);
    for (const opp of top3) {
      const isAlreadyIn = positions.some(p => p.poolName === opp.poolName);
      if (!isAlreadyIn && opp.totalApy >= 8) {
        recommendations.push({
          type: "enter",
          priority: opp.totalApy >= 20 ? "high" : "medium",
          toPool: opp.poolName,
          toProtocol: opp.protocol,
          targetApy: opp.totalApy,
          estimatedGainUsd: opp.estimatedDailyYield ? opp.estimatedDailyYield * 30 : undefined,
          reasoning: `${opp.poolName} offers ${opp.totalApy.toFixed(1)}% APY with risk score ${opp.riskScore}/100. TVL: $${(opp.tvl / 1_000_000).toFixed(1)}M. ${opp.riskFactors[0]}.`,
          autoExecutable: opp.riskScore <= 25 && opp.totalApy >= 5,
        });

        this.log(
          "Enter Recommendation",
          `${opp.poolName}: APY=${opp.totalApy.toFixed(1)}%, risk=${opp.riskScore}, TVL=$${(opp.tvl/1e6).toFixed(0)}M`,
          `Recommended ENTER — ${opp.riskScore <= 25 ? "auto-executable" : "requires confirmation"}`,
          opp.riskScore <= 25 ? 0.85 : 0.7
        );
      }
    }

    // 2. Check existing positions for better alternatives
    for (const position of positions) {
      const betterOpts = opportunities.filter(opp => {
        const apyImprovement = opp.totalApy - position.currentApy;
        return apyImprovement >= 3 && opp.riskScore <= 50;
      });

      if (betterOpts.length > 0) {
        const best = betterOpts[0];
        const improvement = best.totalApy - position.currentApy;

        recommendations.push({
          type: "rebalance",
          priority: improvement >= 10 ? "urgent" : improvement >= 5 ? "high" : "medium",
          fromPool: position.poolName,
          toPool: best.poolName,
          fromProtocol: position.protocol,
          toProtocol: best.protocol,
          currentApy: position.currentApy,
          targetApy: best.totalApy,
          apyImprovement: improvement,
          estimatedGainUsd: (improvement / 100 / 12) * position.currentValueUsd,
          reasoning: `Current position in ${position.poolName} at ${position.currentApy.toFixed(1)}% APY. ${best.poolName} offers ${best.totalApy.toFixed(1)}% (+${improvement.toFixed(1)}pp improvement). Risk is manageable at ${best.riskScore}/100.`,
          autoExecutable: false, // Exits always require confirmation
        });

        this.log(
          "Rebalance Analysis",
          `${position.poolName} → ${best.poolName}: +${improvement.toFixed(1)}pp APY improvement`,
          "Recommended REBALANCE — user confirmation required (capital movement)",
          0.75
        );
      } else {
        // Position is already well-placed
        recommendations.push({
          type: "monitor",
          priority: "low",
          fromPool: position.poolName,
          fromProtocol: position.protocol,
          currentApy: position.currentApy,
          reasoning: `${position.poolName} at ${position.currentApy.toFixed(1)}% APY is competitive. No significantly better alternatives found within risk tolerance.`,
          autoExecutable: false,
        });

        this.log(
          "Position Review",
          `${position.poolName} is already near-optimal for its risk tier`,
          "Recommended MONITOR — no action needed",
          0.9
        );
      }
    }

    // 3. If no positions yet, recommend entry into lowest-risk best-APY
    if (positions.length === 0 && opportunities.length > 0) {
      const safeBest = opportunities.find(o => o.riskScore <= 25);
      if (safeBest) {
        recommendations.unshift({
          type: "enter",
          priority: "high",
          toPool: safeBest.poolName,
          toProtocol: safeBest.protocol,
          targetApy: safeBest.totalApy,
          reasoning: `No current yield positions detected. ${safeBest.poolName} (${safeBest.totalApy.toFixed(1)}% APY, risk: ${safeBest.riskScore}/100) is the best low-risk entry point.`,
          autoExecutable: true,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));

    this.log(
      "Recommendation Summary",
      `Generated ${recommendations.length} recommendations: ${recommendations.filter(r => r.priority === "urgent").length} urgent, ${recommendations.filter(r => r.priority === "high").length} high`,
      "Decision engine complete",
      0.95
    );

    return recommendations;
  }

  /**
   * Build a market summary from the scanned opportunities.
   */
  buildSummary(
    opportunities: YieldOpportunity[],
    positions: WalletYieldPosition[]
  ): YieldSummary {
    const best = opportunities[0];
    const avgMarketApy = opportunities.length > 0
      ? opportunities.reduce((sum, o) => sum + o.totalApy, 0) / opportunities.length
      : 0;

    const walletCurrentApy = positions.length > 0
      ? positions.reduce((sum, p) => sum + p.currentApy * p.currentValueUsd, 0) /
        positions.reduce((sum, p) => sum + p.currentValueUsd, 0)
      : 0;

    const totalPositionValue = positions.reduce((sum, p) => sum + p.currentValueUsd, 0);
    const potentialGainUsd = best && totalPositionValue > 0
      ? ((best.totalApy - walletCurrentApy) / 100 / 12) * totalPositionValue
      : 0;

    return {
      bestApy: best?.totalApy ?? 0,
      bestProtocol: best?.protocol ?? "none",
      bestPool: best?.poolName ?? "none",
      averageMarketApy: avgMarketApy,
      walletCurrentApy,
      potentialGainUsd: Math.max(0, potentialGainUsd),
    };
  }

  getDecisionLog(): AgentDecisionLog[] {
    return this.decisions;
  }

  private log(step: string, reasoning: string, outcome: string, confidence: number): void {
    this.decisions.push({
      timestamp: new Date(),
      step,
      reasoning,
      outcome,
      confidence,
    });
  }
}
