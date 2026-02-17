"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngine = void 0;
class DecisionEngine {
    constructor() {
        this.analyzers = [];
        this.reasoningLog = [];
        this.history = [];
    }
    registerAnalyzer(analyzer, weight = 1.0) {
        this.analyzers.push({ analyzer, weight });
    }
    logReasoning(message) {
        this.reasoningLog.push(`[${new Date().toISOString()}] ${message}`);
    }
    async decide(request) {
        this.reasoningLog = [];
        this.logReasoning(`Starting decision process for: ${request.type}`);
        const findings = [];
        let totalScore = 0;
        let totalWeight = 0;
        let totalConfidence = 0;
        const analyzerResults = {};
        const failedAnalyzers = [];
        // 1. Analyze: Run all registered analyzers
        for (const { analyzer, weight } of this.analyzers) {
            try {
                this.logReasoning(`Running analyzer: ${analyzer.name} (weight: ${weight})`);
                const result = await analyzer.analyze(request.data, request.context);
                analyzerResults[analyzer.name] = result;
                totalScore += result.score * weight;
                totalConfidence += result.confidence * weight;
                totalWeight += weight;
                result.findings.forEach(f => {
                    findings.push(`[${analyzer.name}] ${f}`);
                    this.logReasoning(`Finding: [${analyzer.name}] ${f}`);
                });
                this.logReasoning(`${analyzer.name} score: ${result.score.toFixed(2)}, confidence: ${result.confidence.toFixed(2)}`);
            }
            catch (e) {
                const errorMsg = e instanceof Error ? e.message : String(e);
                this.logReasoning(`Analyzer ${analyzer.name} failed: ${errorMsg}`);
                failedAnalyzers.push(analyzer.name);
            }
        }
        // 2. Evaluate: Calculate weighted scores
        if (totalWeight === 0) {
            this.logReasoning('No successful analysis results. Defaulting to reject.');
            return this.createResult('reject', 0, 0, ['No analysis data available']);
        }
        const avgScore = totalScore / totalWeight;
        const avgConfidence = totalConfidence / totalWeight;
        // 3. Decide: Apply decision logic (Thresholds)
        let decision = 'wait';
        let action = 'monitor';
        // Critical failure check
        if (failedAnalyzers.length > 0 && failedAnalyzers.length > this.analyzers.length / 2) {
            decision = 'escalate'; // Too many analyzers failed
            action = 'manual_review_required';
            this.logReasoning('Critical failure: Majority of analyzers failed.');
        }
        else {
            // Standard thresholds
            // Score: 0 (bad/risky) to 1 (good/safe)
            // Confidence: 0 (uncertain) to 1 (certain)
            if (avgScore >= 0.8 && avgConfidence >= 0.7) {
                decision = 'execute';
                action = 'proceed';
            }
            else if (avgScore < 0.4) {
                decision = 'reject';
                action = 'block';
            }
            else if (avgConfidence < 0.5) {
                decision = 'escalate';
                action = 'human_review';
            }
            else {
                decision = 'wait';
                action = 'monitor';
            }
        }
        this.logReasoning(`Final decision: ${decision} (Weighted Score: ${avgScore.toFixed(2)}, Weighted Confidence: ${avgConfidence.toFixed(2)})`);
        const result = this.createResult(decision, avgScore, avgConfidence, findings, action, analyzerResults);
        this.history.push(result);
        return result;
    }
    createResult(decision, score, confidence, reasoning, action, metadata) {
        return {
            decision,
            action,
            reasoning: [...this.reasoningLog, ...reasoning], // Include full logs + summary findings
            confidence,
            metadata: {
                score,
                ...metadata
            }
        };
    }
}
exports.DecisionEngine = DecisionEngine;
