import { PortfolioRiskAssessment } from "@solana-agent-sdk/core";
import { Alert, TokenHolding, PortfolioReport } from "./types";

export class AlertGenerator {
  static generateAlerts(
    holdings: TokenHolding[],
    riskAssessment: PortfolioRiskAssessment
  ): Alert[] {
    const alerts: Alert[] = [];

    // 1. Rug Risk Alerts
    for (const holding of holdings) {
      if (holding.rugRiskScore > 0.7) {
        alerts.push({
          level: 'critical',
          type: 'rug_risk',
          token: holding.symbol,
          message: `High rug pull risk detected for ${holding.symbol} (${(holding.rugRiskScore * 100).toFixed(1)}%)`,
          action: 'Consider reducing exposure or exiting position immediately.'
        });
      } else if (holding.rugRiskScore > 0.4) {
        alerts.push({
          level: 'warning',
          type: 'rug_risk',
          token: holding.symbol,
          message: `Moderate rug risk for ${holding.symbol}`,
          action: 'Monitor token social sentiment and developer activity.'
        });
      }
    }

    // 2. Concentration Alerts
    if (riskAssessment.topHoldingsConcentration > 60) {
      alerts.push({
        level: 'warning',
        type: 'concentration',
        message: `High portfolio concentration: Top holding is ${(riskAssessment.topHoldingsConcentration).toFixed(1)}% of value.`,
        action: 'Diversify into other assets to reduce single-point-of-failure risk.'
      });
    }

    // 3. Stability Alerts
    if (riskAssessment.stabilityScore < 0.4) {
      alerts.push({
        level: 'warning',
        type: 'suspicious_pattern',
        message: `Low portfolio stability score (${(riskAssessment.stabilityScore * 100).toFixed(1)}/100)`,
        action: 'Review overall asset quality.'
      });
    }

    return alerts;
  }

  static generateRecommendations(alerts: Alert[]): string[] {
    const recommendations: string[] = [];
    
    if (alerts.some(a => a.level === 'critical')) {
      recommendations.push("URGENT: Address high-risk rug pull threats in your holdings.");
    }
    
    if (alerts.some(a => a.type === 'concentration')) {
      recommendations.push("DIVERSIFY: Your portfolio is heavily weighted in a single asset.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Maintain current strategy. Portfolio appears healthy.");
    }

    return recommendations;
  }
}
