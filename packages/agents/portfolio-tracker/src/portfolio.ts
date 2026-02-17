import { ParsedTransaction, BalanceChange, TokenBalance } from "@solana-agent-sdk/core";
import { TokenHolding, PortfolioState } from "./types";

export class PortfolioCalculator {
  /**
   * Builds the current portfolio state from a list of transactions
   * Note: In a real agent, this would be supplemented by direct balance calls
   */
  static buildStateFromTransactions(
    walletAddress: string, 
    transactions: ParsedTransaction[]
  ): PortfolioState {
    const balances = new Map<string, number>();
    
    // Sort oldest to newest to replay
    const sortedTxs = [...transactions].sort((a, b) => (a.blockTime || 0) - (b.blockTime || 0));

    for (const tx of sortedTxs) {
      for (const change of tx.balanceChanges) {
        if (change.address === walletAddress) {
          const mint = change.token || "SOL";
          const current = balances.get(mint) || 0;
          // We use the absolute 'after' balance if it's the most recent for this token in this TX
          // But since we are replaying, we can also just track changes
          balances.set(mint, change.after);
        }
      }
    }

    const tokenBalances: TokenBalance[] = Array.from(balances.entries()).map(([mint, amount]) => ({
      mint,
      amount
    }));

    return {
      walletAddress,
      balances: tokenBalances,
      lastUpdated: Date.now(),
      totalValueSol: 0 // Will be calculated later with prices
    };
  }

  /**
   * Calculates P&L and other metrics for holdings
   */
  static calculateHoldings(
    state: PortfolioState,
    transactions: ParsedTransaction[],
    mockPrices: Record<string, number> = { "SOL": 1.0 }
  ): TokenHolding[] {
    const holdings: TokenHolding[] = [];

    for (const balance of state.balances) {
      const priceSol = mockPrices[balance.mint] || mockPrices["DEFAULT"] || 0.01;
      const totalValueSol = balance.amount * priceSol;
      
      // Rough cost basis calculation from transactions
      let costBasisSol = 0;
      let netBought = 0;

      for (const tx of transactions) {
        const change = tx.balanceChanges.find(c => c.address === state.walletAddress && (c.token || "SOL") === balance.mint);
        if (change && change.change > 0) {
          // If they received token, try to find what they paid (simplified)
          const solChange = tx.balanceChanges.find(c => c.address === state.walletAddress && c.token === null);
          if (solChange && solChange.change < 0) {
             costBasisSol += Math.abs(solChange.change);
             netBought += change.change;
          }
        }
      }

      const avgCostBasis = netBought > 0 ? costBasisSol / netBought : priceSol;
      const totalCostBasis = balance.amount * avgCostBasis;
      const unrealizedPnLSol = totalValueSol - totalCostBasis;
      const unrealizedPnLPercent = totalCostBasis > 0 ? (unrealizedPnLSol / totalCostBasis) * 100 : 0;

      holdings.push({
        ...balance,
        symbol: balance.mint === "SOL" ? "SOL" : balance.mint.substring(0, 4).toUpperCase(),
        priceSol,
        totalValueSol,
        costBasisSol: avgCostBasis,
        unrealizedPnLSol,
        unrealizedPnLPercent,
        rugRiskScore: 0 // Filled by risk assessment
      });
    }

    return holdings;
  }
}
