"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenMetadata = fetchTokenMetadata;
exports.fetchTopHolders = fetchTopHolders;
exports.isMintDisabled = isMintDisabled;
exports.isFreezeDisabled = isFreezeDisabled;
exports.calculateConcentration = calculateConcentration;
/**
 * Fetch token metadata from Solana
 */
async function fetchTokenMetadata(connection, mint) {
    try {
        const mintInfo = await connection.getParsedAccountInfo(mint);
        if (!mintInfo.value || !mintInfo.value.data) {
            return null;
        }
        const data = mintInfo.value.data;
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
    }
    catch (error) {
        console.error(`Failed to fetch token metadata for ${mint.toBase58()}:`, error);
        return null;
    }
}
/**
 * Fetch top token holders
 */
async function fetchTopHolders(connection, mint, limit = 10) {
    try {
        const largestAccounts = await connection.getTokenLargestAccounts(mint);
        const totalSupply = largestAccounts.value.reduce((sum, a) => sum + Number(a.amount), 0);
        return largestAccounts.value.slice(0, limit).map(account => ({
            address: account.address.toBase58(),
            balance: Number(account.amount),
            percentage: (Number(account.amount) / totalSupply) * 100,
        }));
    }
    catch (error) {
        console.error(`Failed to fetch top holders for ${mint.toBase58()}:`, error);
        return [];
    }
}
/**
 * Check if mint authority is disabled (good sign)
 */
function isMintDisabled(metadata) {
    return metadata.mintAuthority === null;
}
/**
 * Check if freeze authority is disabled (good sign)
 */
function isFreezeDisabled(metadata) {
    return metadata.freezeAuthority === null;
}
/**
 * Calculate holder concentration (Herfindahl index)
 */
function calculateConcentration(holders) {
    return holders.reduce((sum, h) => sum + Math.pow(h.percentage / 100, 2), 0);
}
