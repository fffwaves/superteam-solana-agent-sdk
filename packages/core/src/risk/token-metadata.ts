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
  topHolders?: Array<{ address: string; balance: number; percentage: number }>;
}

/**
 * Fetch token metadata from Solana
 */
export async function fetchTokenMetadata(
  connection: Connection,
  mint: PublicKey
): Promise<TokenMetadata | null> {
  try {
    const mintInfo = await connection.getParsedAccountInfo(mint);
    
    if (!mintInfo.value || !mintInfo.value.data) {
      return null;
    }

    const data = mintInfo.value.data as any;
    if (data.program !== 'spl-token' || data.parsed.type !== 'mint') {
      return null;
    }

    const parsed = data.parsed.info;

    return {
      mint: mint.toBase58(),
      symbol: 'UNKNOWN', // Would need to fetch from metadata program
      name: 'Unknown Token',
      decimals: parsed.decimals,
      supply: parsed.supply,
      mintAuthority: parsed.mintAuthority,
      freezeAuthority: parsed.freezeAuthority,
    };
  } catch (error) {
    console.error(`Failed to fetch token metadata for ${mint.toBase58()}:`, error);
    return null;
  }
}

/**
 * Fetch top token holders
 */
export async function fetchTopHolders(
  connection: Connection,
  mint: PublicKey,
  limit: number = 10
): Promise<Array<{ address: string; balance: number; percentage: number }>> {
  try {
    const largestAccounts = await connection.getTokenLargestAccounts(mint);
    const totalSupply = largestAccounts.value.reduce((sum, a) => sum + Number(a.amount), 0);

    return largestAccounts.value.slice(0, limit).map(account => ({
      address: account.address.toBase58(),
      balance: Number(account.amount),
      percentage: (Number(account.amount) / totalSupply) * 100,
    }));
  } catch (error) {
    console.error(`Failed to fetch top holders for ${mint.toBase58()}:`, error);
    return [];
  }
}

/**
 * Check if mint authority is disabled (good sign)
 */
export function isMintDisabled(metadata: TokenMetadata): boolean {
  return metadata.mintAuthority === null;
}

/**
 * Check if freeze authority is disabled (good sign)
 */
export function isFreezeDisabled(metadata: TokenMetadata): boolean {
  return metadata.freezeAuthority === null;
}

/**
 * Calculate holder concentration (Herfindahl index)
 */
export function calculateConcentration(holders: Array<{ percentage: number }>): number {
  return holders.reduce((sum, h) => sum + Math.pow(h.percentage / 100, 2), 0);
}
