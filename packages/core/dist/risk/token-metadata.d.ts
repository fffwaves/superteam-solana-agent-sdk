import { Connection, PublicKey } from '@solana/web3.js';
export interface TokenMetadata {
    mint: string;
    symbol: string;
    name: string;
    decimals: number;
    supply: string;
    mintAuthority: string | null;
    freezeAuthority: string | null;
    holderCount?: number;
    topHolders?: Array<{
        address: string;
        balance: number;
        percentage: number;
    }>;
}
/**
 * Fetch token metadata from Solana
 */
export declare function fetchTokenMetadata(connection: Connection, mint: PublicKey): Promise<TokenMetadata | null>;
/**
 * Fetch top token holders
 */
export declare function fetchTopHolders(connection: Connection, mint: PublicKey, limit?: number): Promise<Array<{
    address: string;
    balance: number;
    percentage: number;
}>>;
/**
 * Check if mint authority is disabled (good sign)
 */
export declare function isMintDisabled(metadata: TokenMetadata): boolean;
/**
 * Check if freeze authority is disabled (good sign)
 */
export declare function isFreezeDisabled(metadata: TokenMetadata): boolean;
/**
 * Calculate holder concentration (Herfindahl index)
 */
export declare function calculateConcentration(holders: Array<{
    percentage: number;
}>): number;
