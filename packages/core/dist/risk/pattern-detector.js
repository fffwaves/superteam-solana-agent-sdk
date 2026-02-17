"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSuspiciousPatterns = detectSuspiciousPatterns;
exports.detectVolumeSpikes = detectVolumeSpikes;
/**
 * Detect suspicious patterns in a set of transactions
 */
function detectSuspiciousPatterns(transactions, userAddress) {
    const patterns = [];
    // Sort by time
    const sorted = [...transactions].sort((a, b) => (a.blockTime || 0) - (b.blockTime || 0));
    // 1. Detect rapid transfers (spamming)
    if (sorted.length >= 5 && sorted[0].blockTime && sorted[sorted.length - 1].blockTime) {
        const timeSpan = sorted[sorted.length - 1].blockTime - sorted[0].blockTime;
        const frequency = sorted.length / (timeSpan / 60); // tx per minute
        if (frequency > 20) {
            patterns.push({
                type: 'rapid_transfers',
                confidence: 0.8,
                description: `High transaction frequency: ${frequency.toFixed(1)} tx/min`,
            });
        }
    }
    // 2. Detect wash trading (A -> B -> A)
    // This would require deeper analysis of account movement
    // 3. New account activity
    // Check if first transaction in window is very recent
    return patterns;
}
/**
 * Check for unusually large transfers relative to historical mean
 */
function detectVolumeSpikes(currentAmount, historicalAmounts) {
    if (historicalAmounts.length < 5)
        return false;
    const mean = historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length;
    const stdDev = Math.sqrt(historicalAmounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / historicalAmounts.length);
    return currentAmount > mean + (3 * stdDev);
}
