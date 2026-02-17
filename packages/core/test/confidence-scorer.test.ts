/**
 * Unit tests for ConfidenceScorer (task 5.6)
 * Pure logic tests — no network calls required.
 * Run: cd packages/core && npx ts-node test/confidence-scorer.test.ts
 */

import { calculateConfidenceScore, ConfidenceInput } from '../src/risk/confidence-scorer';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, extra?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${extra ? ` — ${extra}` : ''}`);
    failed++;
  }
}

// ── Test 1: No inputs → insufficient_data ───────────────────────────────────
console.log('\n1. Empty input');
{
  const result = calculateConfidenceScore({});
  assert(result.recommendation === 'insufficient_data', 'Empty input → insufficient_data');
  assert(result.safetyScore === 0, 'Safety score is 0');
  assert(result.assessmentConfidence === 0, 'Assessment confidence is 0');
}

// ── Test 2: Critical rug pull → block ───────────────────────────────────────
console.log('\n2. Critical rug pull risk');
{
  const input: ConfidenceInput = {
    rugPullRisk: {
      score: 95,
      level: 'critical',
      confidence: 0.9,
      flags: ['⚠️ Mint authority not renounced', '🚩 Top holder owns 80% of supply'],
      details: { mintAuthority: true, topHolderPercentage: 80 },
    },
  };
  const result = calculateConfidenceScore(input);
  assert(result.recommendation === 'block', 'Critical rug → block');
  assert(result.safetyScore < 20, `Safety score < 20 (got ${result.safetyScore})`);
  assert(result.components.rugPull !== null, 'Rug component populated');
  assert(result.components.rugPull!.score < 10, 'Rug component score < 10');
}

// ── Test 3: Clean token, no MEV, no patterns → proceed ─────────────────────
console.log('\n3. Clean signals → proceed');
{
  const input: ConfidenceInput = {
    rugPullRisk: {
      score: 10,
      level: 'low',
      confidence: 0.85,
      flags: [],
      details: { mintAuthority: false, freezeAuthority: false, concentration: 0.12 },
    },
    mevExposure: {
      hasJitoTip: true,
      isPotentialSandwich: false,
      frontrunRisk: 0.1,
      details: ['Transaction includes a Jito tip - likely part of a bundle'],
    },
    suspiciousPatterns: [],
  };
  const result = calculateConfidenceScore(input);
  assert(result.recommendation === 'proceed', `Clean signals → proceed (got ${result.recommendation})`);
  assert(result.safetyScore >= 80, `Safety score ≥ 80 (got ${result.safetyScore})`);
  assert(result.assessmentConfidence >= 0.7, `Confidence ≥ 0.7 (got ${result.assessmentConfidence})`);
}

// ── Test 4: High MEV risk → caution/block ───────────────────────────────────
console.log('\n4. High MEV exposure with medium rug risk');
{
  const input: ConfidenceInput = {
    rugPullRisk: {
      score: 40,
      level: 'medium',
      confidence: 0.7,
      flags: ['⚠️ Freeze authority not renounced'],
      details: { freezeAuthority: true },
    },
    mevExposure: {
      hasJitoTip: false,
      isPotentialSandwich: true,
      frontrunRisk: 0.85,
      details: ['High price impact detected: 12.50%', 'High slippage tolerance: 5.00%', 'Potential sandwich attack detected'],
    },
  };
  const result = calculateConfidenceScore(input);
  assert(
    result.recommendation === 'caution' || result.recommendation === 'block',
    `High MEV → caution or block (got ${result.recommendation})`
  );
  assert(result.safetyScore < 70, `Safety score < 70 (got ${result.safetyScore})`);
}

// ── Test 5: Portfolio risk integration ──────────────────────────────────────
console.log('\n5. Concentrated, high-risk portfolio');
{
  const input: ConfidenceInput = {
    portfolioRisk: {
      overallRiskScore: 80, // high risk
      concentrationScore: 75,
      tokenRisks: new Map([
        ['token1', { score: 80, level: 'high', confidence: 0.8, flags: ['Rug risk'], details: {} }],
        ['token2', { score: 70, level: 'high', confidence: 0.7, flags: ['High concentration'], details: {} }],
      ]),
      topHoldingsConcentration: 70,
      stabilityScore: 0.2,
      details: ['High portfolio concentration', 'Low portfolio stability - high exposure to risky assets'],
    },
    suspiciousPatterns: [
      { type: 'wash_trading', confidence: 0.7, description: 'Repeated buy/sell cycles detected' },
    ],
  };
  const result = calculateConfidenceScore(input);
  assert(
    result.recommendation === 'caution' || result.recommendation === 'block',
    `Risky portfolio → caution or block (got ${result.recommendation})`
  );
  assert(result.components.portfolio !== null, 'Portfolio component populated');
  assert(result.components.patterns !== null, 'Patterns component populated');
  assert(result.components.patterns!.findings.length > 0, 'Pattern findings non-empty');
}

// ── Test 6: Low confidence → insufficient_data despite good signals ──────────
console.log('\n6. Low confidence inputs → insufficient_data');
{
  const input: ConfidenceInput = {
    rugPullRisk: {
      score: 30,
      level: 'low',
      confidence: 0.1, // very low confidence — couldn't verify
      flags: ['Risk assessment failed'],
      details: {},
    },
  };
  const result = calculateConfidenceScore(input);
  // 0.1 confidence on the only component → overall confidence = 0.1 * 0.45 / 0.45 = 0.1
  // 0.1 < MIN_CONFIDENCE (0.35) → insufficient_data
  assert(result.recommendation === 'insufficient_data', `Low confidence → insufficient_data (got ${result.recommendation})`);
}

// ── Test 7: confidenceScoreToAnalysisResult format ──────────────────────────
console.log('\n7. Output format for DecisionEngine');
{
  const { confidenceScoreToAnalysisResult } = require('../src/risk/confidence-scorer');
  const input: ConfidenceInput = {
    rugPullRisk: {
      score: 20,
      level: 'low',
      confidence: 0.8,
      flags: [],
      details: {},
    },
  };
  const score = calculateConfidenceScore(input);
  const analysisResult = confidenceScoreToAnalysisResult(score);
  assert(analysisResult.score >= 0 && analysisResult.score <= 1, 'DecisionEngine score in [0,1]');
  assert(analysisResult.confidence >= 0 && analysisResult.confidence <= 1, 'Confidence in [0,1]');
  assert(Array.isArray(analysisResult.findings), 'Findings is array');
  assert(analysisResult.metadata?.recommendation !== undefined, 'Metadata has recommendation');
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ All tests passed');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
