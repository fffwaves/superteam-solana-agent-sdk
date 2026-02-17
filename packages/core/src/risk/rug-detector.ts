import { Connection, PublicKey } from '@solana/web3.js';
import { TokenMetadata, fetchTokenMetadata, fetchTopHolders, calculateConcentration } from './token-metadata';

export interface RugPullRisk {
  score: number; // 0-100, higher = more risky
  level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1, higher = more confident in assessment
  flags: string[];
  details: {
    concentration?: number;
    topHolderPercentage?: number;
    mintAuthority?: boolean;
    freezeAuthority?: boolean;
    liquidity?: string;
  };
}

/**
 * Detect rug pull risk for a token
 */
export async function detectRugPull(
  connection: Connection,
  mint: PublicKey
): Promise<RugPullRisk> {
  const metadata = await fetchTokenMetadata(connection, mint);
  
  if (!metadata) {
    return {
      score: 100,
      level: 'critical',
      confidence: 0.2, // Low confidence because we couldn't fetch metadata
      flags: ['Unable to fetch token metadata'],
      details: {},
    };
  }

  const topHolders = await fetchTopHolders(connection, mint, 10);
  
  const flags: string[] = [];
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
    const concentration = calculateConcentration(topHolders);

    if (topHolderPct > 50) {
      flags.push(`🚩 Top holder owns ${topHolderPct.toFixed(1)}% of supply`);
      score += 40;
    } else if (topHolderPct > 25) {
      flags.push(`⚠️ Top holder owns ${topHolderPct.toFixed(1)}% of supply`);
      score += 25;
    } else if (topHolderPct > 10) {
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
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 75) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 25) level = 'medium';
  else level = 'low';

  // Calculate confidence in this assessment
  // Factors: data availability (holders), clear signals (authorities)
  let confidence = 0.5; // Base confidence

  // If we have holder data, confidence increases
  if (topHolders.length > 0) {
    confidence += 0.2;
  }

  // If we have clear authority signals (either renounced or not), confidence increases
  // (We assume fetchTokenMetadata worked, so we know the state)
  confidence += 0.2;

  // If risk score is high but we have few flags, reduce confidence (might be false positive)
  if (score > 70 && flags.length < 2) {
    confidence -= 0.2;
  }

  // If many flags, confidence is high
  if (flags.length >= 3) {
    confidence += 0.1;
  }

  return {
    score,
    level,
    confidence: Math.min(0.99, Math.max(0.1, confidence)),
    flags,
    details: {
      concentration: topHolders.length > 0 ? calculateConcentration(topHolders) : undefined,
      topHolderPercentage: topHolders[0]?.percentage,
      mintAuthority: metadata.mintAuthority !== null,
      freezeAuthority: metadata.freezeAuthority !== null,
    },
  };
}

/**
 * Enhanced confidence scoring for rug pull detection
 * (Helper for external use if needed)
 */
export function calculateRugConfidence(risk: RugPullRisk): {
  confidence: number;
  reasoning: string[];
} {
  const reasoning: string[] = [];
  let confidence = risk.confidence;

  // Additional reasoning explanations
  if (risk.details.topHolderPercentage !== undefined) {
    reasoning.push('Holder distribution analysis included');
  } else {
    reasoning.push('Missing holder distribution data - lower confidence');
  }

  if (risk.details.mintAuthority !== undefined) {
    reasoning.push('Authority analysis included');
  }

  return {
    confidence,
    reasoning,
  };
}

/**
 * Check if a token is likely a rug pull based on historical patterns
 */
export function isLikelyRugPull(risk: RugPullRisk): boolean {
  // Critical level OR multiple high-risk flags
  return risk.level === 'critical' || (risk.level === 'high' && risk.flags.length >= 3);
}
