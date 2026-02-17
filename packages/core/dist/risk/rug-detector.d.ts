import { Connection, PublicKey } from '@solana/web3.js';
export interface RugPullRisk {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
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
 * Check if a token is likely a rug pull based on historical patterns
 */
export declare function isLikelyRugPull(risk: RugPullRisk): boolean;
/**
 * Get confidence score for rug pull detection
 */
export declare function getConfidence(risk: RugPullRisk): number;
