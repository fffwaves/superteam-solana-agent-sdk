import { RugPullRisk } from './rug-detector';
import { MEVExposure } from './mev-detector';
import { PortfolioRiskAssessment } from './portfolio-risk';
import { SuspiciousPattern } from './pattern-detector';

export interface ConfidenceInput {
  rugPullRisk?: RugPullRisk;
  mevExposure?: MEVExposure;
  portfolioRisk?: PortfolioRiskAssessment;
  suspiciousPatterns?: SuspiciousPattern[];
}

export interface ConfidenceScore {
  /** 0-100: how confident we are this is SAFE to proceed (100 = very safe) */
  safetyScore: number;
  /** 0-1: how confident we are in our assessment (1 = high data quality) */
  assessmentConfidence: number;
  /** Human-readable reasoning behind the scores */
  reasoning: string[];
  /** Individual component scores for transparency */
  components: {
    rugPull: ComponentScore | null;
    mev: ComponentScore | null;
    portfolio: ComponentScore | null;
    patterns: ComponentScore | null;
  };
  /** Recommended action based on score */
  recommendation: 'proceed' | 'caution' | 'block' | 'insufficient_data';
}

export interface ComponentScore {
  /** 0-100: safety score for this component */
  score: number;
  /** 0-1: confidence in this component's score */
  confidence: number;
  /** Weight used in final calculation */
  weight: number;
  /** Key findings */
  findings: string[];
}

/**
 * Weights for each risk component.
 * Must sum to 1.0.
 */
const WEIGHTS = {
  rugPull: 0.45,  // Most critical — a rug is catastrophic
  mev: 0.20,      // Meaningful but survivable with good params
  portfolio: 0.25, // Portfolio-wide context
  patterns: 0.10, // Behavioural signals
} as const;

/**
 * Minimum confidence threshold to emit a recommendation.
 * Below this, we don't have enough data to be sure.
 */
const MIN_CONFIDENCE_FOR_RECOMMENDATION = 0.35;

/**
 * ConfidenceScorer: Unified scoring system that combines signals from all risk
 * analyzers into a single safety score and assessment confidence value.
 *
 * This is the bridge between individual analyzers and the DecisionEngine.
 *
 * Safety Score (0-100):
 *   80+  → proceed (high confidence it's safe)
 *   60-79 → caution (monitor, smaller position sizing)
 *   <60  → block (risk is too high)
 *
 * Assessment Confidence (0-1):
 *   How much data we had to work with. Low confidence = we couldn't verify
 *   enough signals. Even a high safety score should be treated with scepticism
 *   if assessment confidence is low.
 */
export function calculateConfidenceScore(input: ConfidenceInput): ConfidenceScore {
  const reasoning: string[] = [];
  const components: ConfidenceScore['components'] = {
    rugPull: null,
    mev: null,
    portfolio: null,
    patterns: null,
  };

  // ── 1. Rug Pull Component ────────────────────────────────────────────────
  if (input.rugPullRisk) {
    const r = input.rugPullRisk;
    // rug-detector uses 0-100 where 100 = max risk; invert for safety score
    const safetyFromRug = Math.max(0, 100 - r.score);

    components.rugPull = {
      score: safetyFromRug,
      confidence: r.confidence,
      weight: WEIGHTS.rugPull,
      findings: r.flags,
    };

    reasoning.push(
      `Rug pull assessment: ${r.level.toUpperCase()} risk (score ${r.score}/100, confidence ${(r.confidence * 100).toFixed(0)}%)`
    );

    if (r.flags.length > 0) {
      r.flags.forEach(f => reasoning.push(`  • ${f}`));
    }
  }

  // ── 2. MEV Exposure Component ────────────────────────────────────────────
  if (input.mevExposure) {
    const m = input.mevExposure;
    // frontrunRisk is 0-1 where 1 = max risk; invert and scale to 0-100
    const safetyFromMev = Math.max(0, (1 - m.frontrunRisk) * 100);

    // MEV confidence heuristic: Jito bundles give us higher signal
    const mevConfidence = m.hasJitoTip
      ? 0.85  // Jito tip = clear signal, high confidence
      : m.details.length > 0
        ? 0.70  // We found signals but no Jito
        : 0.40; // No signals detected (could mean clean OR just no swap)

    components.mev = {
      score: safetyFromMev,
      confidence: mevConfidence,
      weight: WEIGHTS.mev,
      findings: m.details,
    };

    const mevLabel = m.frontrunRisk > 0.7 ? 'HIGH' : m.frontrunRisk > 0.3 ? 'MEDIUM' : 'LOW';
    reasoning.push(
      `MEV exposure: ${mevLabel} frontrun risk (${(m.frontrunRisk * 100).toFixed(0)}%)` +
      (m.hasJitoTip ? ' — Jito bundle detected' : '') +
      (m.isPotentialSandwich ? ' — sandwich attack likely' : '')
    );
  }

  // ── 3. Portfolio Risk Component ──────────────────────────────────────────
  if (input.portfolioRisk) {
    const p = input.portfolioRisk;
    // overallRiskScore is 0-100 where 100 = max risk; invert for safety
    const safetyFromPortfolio = Math.max(0, 100 - p.overallRiskScore);

    // Portfolio confidence depends on how many tokens we could analyse
    const tokenCount = p.tokenRisks.size;
    const portfolioConfidence =
      tokenCount === 0 ? 0.1
      : tokenCount < 3 ? 0.55
      : tokenCount < 10 ? 0.75
      : 0.90;

    components.portfolio = {
      score: safetyFromPortfolio,
      confidence: portfolioConfidence,
      weight: WEIGHTS.portfolio,
      findings: p.details,
    };

    reasoning.push(
      `Portfolio: ${tokenCount} token(s) assessed — concentration ${p.concentrationScore.toFixed(0)}/100, stability ${(p.stabilityScore * 100).toFixed(0)}%`
    );
    p.details.forEach(d => reasoning.push(`  • ${d}`));
  }

  // ── 4. Suspicious Pattern Component ─────────────────────────────────────
  if (input.suspiciousPatterns && input.suspiciousPatterns.length >= 0) {
    const patterns = input.suspiciousPatterns;

    let patternRiskScore = 0; // 0-100

    if (patterns.length === 0) {
      patternRiskScore = 0; // Clean
    } else {
      // Weight patterns by confidence; each adds risk
      const totalRisk = patterns.reduce((sum, p) => sum + p.confidence * 25, 0);
      patternRiskScore = Math.min(100, totalRisk);
    }

    const safetyFromPatterns = Math.max(0, 100 - patternRiskScore);
    const patternConfidence = patterns.length > 0 ? 0.75 : 0.50;

    components.patterns = {
      score: safetyFromPatterns,
      confidence: patternConfidence,
      weight: WEIGHTS.patterns,
      findings: patterns.map(p => `${p.type}: ${p.description} (${(p.confidence * 100).toFixed(0)}% confident)`),
    };

    if (patterns.length === 0) {
      reasoning.push('Suspicious patterns: None detected');
    } else {
      reasoning.push(`Suspicious patterns: ${patterns.length} detected`);
      patterns.forEach(p => reasoning.push(`  • ${p.type}: ${p.description}`));
    }
  }

  // ── 5. Weighted Aggregation ──────────────────────────────────────────────
  let weightedSafetySum = 0;
  let weightedConfidenceSum = 0;
  let totalWeightUsed = 0;

  const componentEntries: Array<[keyof typeof WEIGHTS, ComponentScore | null]> = [
    ['rugPull', components.rugPull],
    ['mev', components.mev],
    ['portfolio', components.portfolio],
    ['patterns', components.patterns],
  ];

  for (const [key, comp] of componentEntries) {
    if (comp !== null) {
      const w = WEIGHTS[key];
      weightedSafetySum += comp.score * w * comp.confidence; // confidence-weight the safety score
      weightedConfidenceSum += comp.confidence * w;
      totalWeightUsed += w;
    }
  }

  // If no components were provided, we have nothing to score
  if (totalWeightUsed === 0) {
    reasoning.push('No risk signals provided — insufficient data for assessment');
    return {
      safetyScore: 0,
      assessmentConfidence: 0,
      reasoning,
      components,
      recommendation: 'insufficient_data',
    };
  }

  // Normalise: divide by total weight used (not 1.0, since some components may be absent)
  const assessmentConfidence = weightedConfidenceSum / totalWeightUsed;

  // Safety score: weighted average, then normalise by effective confidence
  // This way, low-confidence signals drag the score toward uncertainty (50)
  const rawSafetyScore = assessmentConfidence > 0
    ? weightedSafetySum / weightedConfidenceSum
    : 50;

  const safetyScore = Math.max(0, Math.min(100, rawSafetyScore));

  // ── 6. Recommendation ────────────────────────────────────────────────────
  let recommendation: ConfidenceScore['recommendation'];

  if (assessmentConfidence < MIN_CONFIDENCE_FOR_RECOMMENDATION) {
    recommendation = 'insufficient_data';
    reasoning.push(
      `Assessment confidence too low (${(assessmentConfidence * 100).toFixed(0)}%) to make a reliable recommendation`
    );
  } else if (safetyScore >= 80) {
    recommendation = 'proceed';
    reasoning.push(`Safety score ${safetyScore.toFixed(0)}/100 → PROCEED`);
  } else if (safetyScore >= 60) {
    recommendation = 'caution';
    reasoning.push(`Safety score ${safetyScore.toFixed(0)}/100 → CAUTION (reduce position size)`);
  } else {
    recommendation = 'block';
    reasoning.push(`Safety score ${safetyScore.toFixed(0)}/100 → BLOCK (risk too high)`);
  }

  return {
    safetyScore: Math.round(safetyScore * 10) / 10,
    assessmentConfidence: Math.round(assessmentConfidence * 1000) / 1000,
    reasoning,
    components,
    recommendation,
  };
}

/**
 * Convenience: convert a ConfidenceScore into AnalysisResult format
 * so it can be fed directly into the DecisionEngine as an Analyzer.
 */
export function confidenceScoreToAnalysisResult(score: ConfidenceScore) {
  return {
    score: score.safetyScore / 100,        // 0-1 for DecisionEngine
    confidence: score.assessmentConfidence, // 0-1
    findings: score.reasoning,
    metadata: {
      safetyScore: score.safetyScore,
      recommendation: score.recommendation,
      components: score.components,
    },
  };
}
