import { Analyzer, AnalysisResult } from './types';
import { RugPullRisk } from '../risk/rug-detector';

export class RiskAnalyzer implements Analyzer<RugPullRisk> {
  name = 'risk_analyzer';

  async analyze(risk: RugPullRisk): Promise<AnalysisResult> {
    const findings: string[] = [];
    let score = 1 - (risk.score / 100); // Inverse score (0 = high risk, 1 = low risk)

    if (risk.level === 'critical') {
      findings.push('CRITICAL risk level detected');
    } else if (risk.level === 'high') {
      findings.push('High risk level detected');
    }

    findings.push(...risk.flags);

    return {
      score,
      findings,
      confidence: 0.9, // We trust our rug detector
    };
  }
}
