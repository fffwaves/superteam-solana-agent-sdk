import { Connection, PublicKey } from '@solana/web3.js';
export interface RugPullRisk {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
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
export declare function detectRugPull(connection: Connection, mint: PublicKey): Promise<RugPullRisk>;
/**
 * Enhanced confidence scoring for rug pull detection
 * (Helper for external use if needed)
 */
export declare function calculateRugConfidence(risk: RugPullRisk): {
    confidence: number;
    reasoning: string[];
};
/**
 * Check if a token is likely a rug pull based on historical patterns
 */
export declare function isLikelyRugPull(risk: RugPullRisk): boolean;
