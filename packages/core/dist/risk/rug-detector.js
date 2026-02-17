"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectRugPull = detectRugPull;
exports.isLikelyRugPull = isLikelyRugPull;
exports.getConfidence = getConfidence;
const token_metadata_1 = require("./token-metadata");
/**
 * Detect rug pull risk for a token
 */
async function detectRugPull(connection, mint) {
    const metadata = await (0, token_metadata_1.fetchTokenMetadata)(connection, mint);
    if (!metadata) {
        return {
            score: 100,
            level: 'critical',
            flags: ['Unable to fetch token metadata'],
            details: {},
        };
    }
    const topHolders = await (0, token_metadata_1.fetchTopHolders)(connection, mint, 10);
    const flags = [];
    let score = 0;
    // Check mint authority (30 points if enabled)
    if (metadata.mintAuthority !== null) {
        flags.push('⚠️ Mint authority not renounced - unlimited supply possible');
        score += 30;
    }
    // Check freeze authority (20 points if enabled)
    if (metadata.freezeAuthority !== null) {
        flags.push('⚠️ Freeze authority not renounced - tokens can be frozen');
        score += 20;
    }
    // Check top holder concentration (up to 40 points)
    if (topHolders.length > 0) {
        const topHolderPct = topHolders[0].percentage;
        const concentration = (0, token_metadata_1.calculateConcentration)(topHolders);
        if (topHolderPct > 50) {
            flags.push(`🚩 Top holder owns ${topHolderPct.toFixed(1)}% of supply`);
            score += 40;
        }
        else if (topHolderPct > 25) {
            flags.push(`⚠️ Top holder owns ${topHolderPct.toFixed(1)}% of supply`);
            score += 25;
        }
        else if (topHolderPct > 10) {
            flags.push(`⚠️ Top holder owns ${topHolderPct.toFixed(1)}% of supply`);
            score += 15;
        }
        // High concentration index
        if (concentration > 0.5) {
            flags.push('⚠️ Very high holder concentration');
            score += 10;
        }
    }
    // Determine risk level
    let level;
    if (score >= 75)
        level = 'critical';
    else if (score >= 50)
        level = 'high';
    else if (score >= 25)
        level = 'medium';
    else
        level = 'low';
    return {
        score,
        level,
        flags,
        details: {
            concentration: topHolders.length > 0 ? (0, token_metadata_1.calculateConcentration)(topHolders) : undefined,
            topHolderPercentage: topHolders[0]?.percentage,
            mintAuthority: metadata.mintAuthority !== null,
            freezeAuthority: metadata.freezeAuthority !== null,
        },
    };
}
/**
 * Check if a token is likely a rug pull based on historical patterns
 */
function isLikelyRugPull(risk) {
    // Critical level OR multiple high-risk flags
    return risk.level === 'critical' || (risk.level === 'high' && risk.flags.length >= 3);
}
/**
 * Get confidence score for rug pull detection
 */
function getConfidence(risk) {
    // More flags = higher confidence in assessment
    const flagCount = risk.flags.length;
    if (flagCount >= 4)
        return 0.95;
    if (flagCount >= 3)
        return 0.85;
    if (flagCount >= 2)
        return 0.70;
    if (flagCount >= 1)
        return 0.50;
    return 0.30;
}
