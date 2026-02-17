"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessPortfolioRisk = assessPortfolioRisk;
const web3_js_1 = require("@solana/web3.js");
const rug_detector_1 = require("./rug-detector");
/**
 * Assess overall portfolio risk
 */
async function assessPortfolioRisk(connection, balances) {
    const tokenRisks = new Map();
    let totalValueUsd = balances.reduce((sum, b) => sum + (b.valueUsd || 0), 0);
    const details = [];
    // If no USD value provided, use relative amounts for concentration (fallback)
    const totalAmount = balances.reduce((sum, b) => sum + b.amount, 0);
    // 1. Fetch risk for each token
    for (const balance of balances) {
        try {
            const risk = await (0, rug_detector_1.detectRugPull)(connection, new web3_js_1.PublicKey(balance.mint));
            tokenRisks.set(balance.mint, risk);
        }
        catch (e) {
            console.error(`Failed to detect rug pull for ${balance.mint}:`, e);
            // Add a fallback risk object or continue
            tokenRisks.set(balance.mint, {
                score: 50, // assume medium risk on failure
                level: 'medium',
                confidence: 0.1, // low confidence
                flags: ['Risk assessment failed'],
                details: {}
            });
        }
    }
    // 2. Calculate concentration score (Herfindahl-Hirschman Index)
    let hhi = 0;
    balances.forEach(b => {
        let weight = 0;
        if (totalValueUsd > 0) {
            weight = (b.valueUsd || 0) / totalValueUsd;
        }
        else if (totalAmount > 0) {
            weight = b.amount / totalAmount;
        }
        hhi += weight * weight;
    });
    // HHI ranges from ~0 (diversified) to 1 (monopoly).
    // We map this to 0-100 score.
    const concentrationScore = Math.min(100, hhi * 100);
    if (concentrationScore > 50) {
        details.push('High portfolio concentration - lack of diversification');
    }
    else if (concentrationScore < 15) {
        details.push('Well-diversified portfolio');
    }
    // 3. Calculate stability score based on average rug risk of tokens weighted by value
    let weightedRugScore = 0;
    balances.forEach(b => {
        let weight = 0;
        if (totalValueUsd > 0) {
            weight = (b.valueUsd || 0) / totalValueUsd;
        }
        else if (totalAmount > 0) {
            weight = b.amount / totalAmount;
        }
        const risk = tokenRisks.get(b.mint);
        if (risk) {
            weightedRugScore += risk.score * weight;
        }
    });
    // Stability is the inverse of the weighted risk score (0-1)
    // If average risk score is 100, stability is 0. If 0, stability is 1.
    const stabilityScore = Math.max(0, 1 - (weightedRugScore / 100));
    if (stabilityScore < 0.3) {
        details.push('Low portfolio stability - high exposure to risky assets');
    }
    else if (stabilityScore > 0.8) {
        details.push('High portfolio stability');
    }
    // 4. Top holding analysis
    const sortedBalances = [...balances].sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0) || b.amount - a.amount);
    let topHoldingsWeight = 0;
    if (sortedBalances.length > 0) {
        if (totalValueUsd > 0) {
            topHoldingsWeight = (sortedBalances[0].valueUsd || 0) / totalValueUsd;
        }
        else if (totalAmount > 0) {
            topHoldingsWeight = sortedBalances[0].amount / totalAmount;
        }
        details.push(`Top holding (${sortedBalances[0].mint}) constitutes ${(topHoldingsWeight * 100).toFixed(1)}% of portfolio`);
    }
    // 5. Overall Risk Score Calculation
    // We weight concentration (30%) and asset quality/stability (70%)
    const overallRiskScore = (concentrationScore * 0.3) + ((1 - stabilityScore) * 100 * 0.7);
    return {
        overallRiskScore,
        concentrationScore,
        tokenRisks,
        topHoldingsConcentration: topHoldingsWeight * 100,
        stabilityScore,
        details
    };
}
