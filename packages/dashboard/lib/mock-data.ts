// =============================================================================
// Realistic Solana Mock Data for Dashboard
// All transaction hashes / wallet addresses are realistic-looking but fake.
// =============================================================================

export type TxType = "swap" | "stake" | "transfer" | "unstake" | "liquidity";
export type TxStatus = "success" | "failed" | "pending";
export type AgentStatus = "running" | "idle" | "alert" | "error";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Transaction {
  signature: string;
  blockTime: number; // unix timestamp (seconds)
  type: TxType;
  status: TxStatus;
  description: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  fee: string; // SOL
  protocol: string;
  slot: number;
}

export interface AgentCard {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  lastRun: number; // unix timestamp
  nextRun: number; // unix timestamp
  lastDecision: string;
  decisionConfidence: number; // 0-1
  runsToday: number;
  alertCount: number;
  metrics: {
    label: string;
    value: string;
    trend?: "up" | "down" | "flat";
    trendValue?: string;
  }[];
}

export interface PortfolioHolding {
  token: string;
  symbol: string;
  amount: number;
  valueUsd: number;
  allocation: number; // percent
  apy?: number;
  change24h: number; // percent
}

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  source: string;
  action: string;
}

export interface RiskScore {
  overall: number; // 0-100
  concentration: number;
  volatility: number;
  protocol: number;
  liquidity: number;
}

// ---------------------------------------------------------------------------
// TRANSACTIONS (12 realistic ones)
// ---------------------------------------------------------------------------
export const TRANSACTIONS: Transaction[] = [
  {
    signature: "5r7XYTbkw4GqA9mNpE3sKjL2dHvFcYnRx8QuV6oPiWtZuB1CeM0fsDgIhJlNa",
    blockTime: Math.floor(Date.now() / 1000) - 420,
    type: "swap",
    status: "success",
    description: "Swapped SOL → USDC via Jupiter",
    fromToken: "SOL",
    toToken: "USDC",
    fromAmount: "5.00",
    toAmount: "727.35",
    fee: "0.000025",
    protocol: "Jupiter",
    slot: 312847293,
  },
  {
    signature: "3pKmXwE8vBc5hT2NrGjD7sFyQzLaOiU9MnRt4YkWv6PeA1CbHgIuJlZoNdSx",
    blockTime: Math.floor(Date.now() / 1000) - 1800,
    type: "stake",
    status: "success",
    description: "Staked SOL → mSOL via Marinade",
    fromToken: "SOL",
    toToken: "mSOL",
    fromAmount: "10.00",
    toAmount: "9.78",
    fee: "0.000015",
    protocol: "Marinade",
    slot: 312838102,
  },
  {
    signature: "7aKpEwB3vDf9hR1NsGlC6tQyMzJoUi8LnPt5YjWu4OeA2DcHgIuKmZpNeSx",
    blockTime: Math.floor(Date.now() / 1000) - 3600,
    type: "swap",
    status: "success",
    description: "Swapped USDC → JUP via Jupiter",
    fromToken: "USDC",
    toToken: "JUP",
    fromAmount: "200.00",
    toAmount: "178.57",
    fee: "0.000025",
    protocol: "Jupiter",
    slot: 312829047,
  },
  {
    signature: "9bLqFxC4wEg0iS2OtHmD7uRzNaKpVj1MoQu6ZkXv5PfB3EeIgJvLnOoReSx",
    blockTime: Math.floor(Date.now() / 1000) - 7200,
    type: "transfer",
    status: "success",
    description: "Received USDC from 9B2c...Wk3f",
    fromToken: "USDC",
    toToken: "USDC",
    fromAmount: "500.00",
    toAmount: "500.00",
    fee: "0.000005",
    protocol: "SPL Token",
    slot: 312810293,
  },
  {
    signature: "2cMrGyD5xFh1jT3PuInE8vSzOaLqWk2NpRv7AlYw6QgC4FfJhKwMoQpSfTux",
    blockTime: Math.floor(Date.now() / 1000) - 10800,
    type: "liquidity",
    status: "success",
    description: "Added SOL/USDC liquidity to Orca",
    fromToken: "SOL + USDC",
    toToken: "LP Token",
    fromAmount: "2.5 SOL + 362.50",
    toAmount: "0.00847 ORCA-LP",
    fee: "0.000020",
    protocol: "Orca",
    slot: 312791238,
  },
  {
    signature: "4dNsHzE6yGi2kU4QvJoF9wTaPoMrXl3OrSw8BmZx7RhD5GgKiLxNpRqUgVvy",
    blockTime: Math.floor(Date.now() / 1000) - 14400,
    type: "swap",
    status: "success",
    description: "Swapped mSOL → SOL via Jupiter",
    fromToken: "mSOL",
    toToken: "SOL",
    fromAmount: "3.00",
    toAmount: "3.067",
    fee: "0.000025",
    protocol: "Jupiter",
    slot: 312772019,
  },
  {
    signature: "6eOtIaF7zHj3lV5RwKpG0xUbQnNsYm4PsTy9CnAy8SiE6HhLjMyOsSwVhWwz",
    blockTime: Math.floor(Date.now() / 1000) - 21600,
    type: "swap",
    status: "failed",
    description: "Failed swap SOL → BONK (slippage exceeded)",
    fromToken: "SOL",
    toToken: "BONK",
    fromAmount: "1.00",
    toAmount: "0",
    fee: "0.000005",
    protocol: "Jupiter",
    slot: 312752847,
  },
  {
    signature: "8fPuJbG8aIk4mW6SxLqH1yVcRoOtZn5QuTz0DoBz9TjF7IiMkNzPtTxWiXxA",
    blockTime: Math.floor(Date.now() / 1000) - 28800,
    type: "stake",
    status: "success",
    description: "Staked additional SOL → mSOL via Marinade",
    fromToken: "SOL",
    toToken: "mSOL",
    fromAmount: "5.00",
    toAmount: "4.89",
    fee: "0.000015",
    protocol: "Marinade",
    slot: 312733612,
  },
  {
    signature: "1gQvKcH9bJl5nX7TyMrI2zWdSpPuAo6RvUa1EpCa0UkG8JjNlOaQuUyXjYyB",
    blockTime: Math.floor(Date.now() / 1000) - 36000,
    type: "transfer",
    status: "success",
    description: "Sent USDC to Cb4p...7mNR",
    fromToken: "USDC",
    toToken: "USDC",
    fromAmount: "100.00",
    toAmount: "100.00",
    fee: "0.000005",
    protocol: "SPL Token",
    slot: 312714401,
  },
  {
    signature: "3hRwLdI0cKm6oY8UzNsJ3aXeToQvBp7SwVb2FqDb1VlH9KkOmPbRvVzYkZzC",
    blockTime: Math.floor(Date.now() / 1000) - 43200,
    type: "unstake",
    status: "success",
    description: "Unstaked mSOL → SOL via Marinade (delayed)",
    fromToken: "mSOL",
    toToken: "SOL",
    fromAmount: "2.00",
    toAmount: "2.044",
    fee: "0.000015",
    protocol: "Marinade",
    slot: 312695177,
  },
  {
    signature: "5iSxMeJ1dLn7pZ9VaOtK4bYfUpRwCq8TxWc3GrEc2WmI0LlPnQcSwWaLlAaD",
    blockTime: Math.floor(Date.now() / 1000) - 50400,
    type: "swap",
    status: "success",
    description: "Swapped USDC → mSOL via Jupiter",
    fromToken: "USDC",
    toToken: "mSOL",
    fromAmount: "725.00",
    toAmount: "4.99",
    fee: "0.000025",
    protocol: "Jupiter",
    slot: 312675940,
  },
  {
    signature: "7jTyNfK2eMo8qA0WbPuL5cZgVqSxDr9UyXd4HsEd3XnJ1MmQoRdTxXbMbBeE",
    blockTime: Math.floor(Date.now() / 1000) - 57600,
    type: "transfer",
    status: "success",
    description: "Received SOL from faucet / deposit",
    fromToken: "SOL",
    toToken: "SOL",
    fromAmount: "20.00",
    toAmount: "20.00",
    fee: "0.000005",
    protocol: "System",
    slot: 312656720,
  },
];

// ---------------------------------------------------------------------------
// PORTFOLIO HOLDINGS
// ---------------------------------------------------------------------------
export const PORTFOLIO: PortfolioHolding[] = [
  {
    token: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    amount: 27.53,
    valueUsd: 3993.1,
    allocation: 56.0,
    change24h: 3.2,
  },
  {
    token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    amount: 1527.35,
    valueUsd: 1527.35,
    allocation: 21.4,
    change24h: 0.01,
  },
  {
    token: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3BZTxeHqHwgiFv",
    symbol: "mSOL",
    amount: 16.78,
    valueUsd: 2498.7,
    allocation: 35.0,
    apy: 7.8,
    change24h: 3.1,
  },
  {
    token: "JUPyiwrYJFskUntCRv1aoFTzjrBq9cdPDa6URRyMUm",
    symbol: "JUP",
    amount: 178.57,
    valueUsd: 200.0,
    allocation: 2.8,
    change24h: -1.4,
  },
];

// ---------------------------------------------------------------------------
// AGENT STATUS CARDS
// ---------------------------------------------------------------------------
export const AGENTS: AgentCard[] = [
  {
    id: "portfolio-tracker",
    name: "Portfolio Tracker",
    description: "Monitors holdings, calculates P&L, flags concentration risks",
    status: "running",
    lastRun: Math.floor(Date.now() / 1000) - 180,
    nextRun: Math.floor(Date.now() / 1000) + 120,
    lastDecision:
      "mSOL allocation at 35% — approaching concentration threshold of 40%. No action needed yet; will escalate if mSOL > 40% or rug risk increases above 30/100.",
    decisionConfidence: 0.87,
    runsToday: 48,
    alertCount: 1,
    metrics: [
      { label: "Portfolio Value", value: "$7,127", trend: "up", trendValue: "+$234" },
      { label: "24h P&L", value: "+$234", trend: "up", trendValue: "+3.4%" },
      { label: "7d P&L", value: "+$612", trend: "up", trendValue: "+9.4%" },
      { label: "Risk Score", value: "28/100", trend: "flat" },
    ],
  },
  {
    id: "yield-scout",
    name: "Yield Scout",
    description: "Scans DeFi protocols for optimal yield opportunities",
    status: "idle",
    lastRun: Math.floor(Date.now() / 1000) - 1800,
    nextRun: Math.floor(Date.now() / 1000) + 1800,
    lastDecision:
      "Best yield: mSOL Native Staking at 8.0% APY (Marinade), Risk 10/100, TVL $1.25B. Current position at 7.8% — within 0.2pp of optimal. No rebalance recommended. Will alert if spread exceeds 2pp.",
    decisionConfidence: 0.92,
    runsToday: 12,
    alertCount: 0,
    metrics: [
      { label: "Best Market APY", value: "8.0%", trend: "up", trendValue: "+0.3%" },
      { label: "Your Yield APY", value: "7.8%", trend: "flat" },
      { label: "Protocols Scanned", value: "5", trend: "flat" },
      { label: "Opportunities", value: "12", trend: "up", trendValue: "+3" },
    ],
  },
  {
    id: "risk-monitor",
    name: "Risk Monitor",
    description: "Detects rug pulls, MEV attacks, and suspicious activity",
    status: "alert",
    lastRun: Math.floor(Date.now() / 1000) - 300,
    nextRun: Math.floor(Date.now() / 1000) + 0,
    lastDecision:
      "ALERT: JUP token shows elevated volatility — 4 large sell orders detected in last 15 minutes from whale wallets. Risk score updated to 38/100 (medium). Recommend reducing JUP exposure if risk exceeds 50/100. Monitoring closely.",
    decisionConfidence: 0.78,
    runsToday: 96,
    alertCount: 2,
    metrics: [
      { label: "Threats Detected", value: "2", trend: "up", trendValue: "+1" },
      { label: "Critical", value: "0", trend: "flat" },
      { label: "High Risk", value: "0", trend: "flat" },
      { label: "Medium Risk", value: "2", trend: "up", trendValue: "+1" },
    ],
  },
];

// ---------------------------------------------------------------------------
// RISK ALERTS
// ---------------------------------------------------------------------------
export const RISK_ALERTS: RiskAlert[] = [
  {
    id: "alert-001",
    level: "medium",
    title: "JUP Whale Activity Detected",
    description:
      "4 whale wallets (>100k JUP each) initiated sell orders in the past 15 minutes. Total outflow: ~$48,000. Price impact: -2.3%. Risk score elevated from 22 to 38.",
    timestamp: Math.floor(Date.now() / 1000) - 300,
    resolved: false,
    source: "Risk Monitor",
    action: "Monitor closely. Consider reducing JUP position if outflow continues.",
  },
  {
    id: "alert-002",
    level: "medium",
    title: "mSOL Concentration Approaching Threshold",
    description:
      "mSOL now represents 35.0% of portfolio value. Agent threshold is 40%. At current growth rate (+0.8%/day), threshold will be reached in ~6 days unless rebalanced.",
    timestamp: Math.floor(Date.now() / 1000) - 1200,
    resolved: false,
    source: "Portfolio Tracker",
    action: "No immediate action required. Agent will alert at 38% and recommend rebalance at 40%.",
  },
  {
    id: "alert-003",
    level: "low",
    title: "Failed Swap: High Slippage",
    description:
      "Attempted SOL → BONK swap was blocked due to 6.2% slippage (limit: 2%). Transaction was simulated — no funds moved. BONK price volatility is elevated.",
    timestamp: Math.floor(Date.now() / 1000) - 21600,
    resolved: true,
    source: "Safe Executor",
    action: "Swap cancelled automatically by guardrail. No action needed.",
  },
];

// ---------------------------------------------------------------------------
// RISK SCORE
// ---------------------------------------------------------------------------
export const RISK_SCORE: RiskScore = {
  overall: 28,
  concentration: 35,
  volatility: 22,
  protocol: 15,
  liquidity: 18,
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
export function formatTime(unixTs: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixTs;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatFutureTime(unixTs: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = unixTs - now;
  if (diff <= 0) return "now";
  if (diff < 60) return `in ${diff}s`;
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  return `in ${Math.floor(diff / 3600)}h`;
}

export function shortenSig(sig: string): string {
  return `${sig.slice(0, 8)}…${sig.slice(-6)}`;
}

export const WALLET_ADDRESS = "9B2cKm4nJhFqWvRt3YpEsLo1Xu8DbPaGdIwNkZoMp7f";
