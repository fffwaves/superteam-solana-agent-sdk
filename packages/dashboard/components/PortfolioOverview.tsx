"use client";

import { PORTFOLIO, PortfolioHolding } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const TOKEN_COLORS: Record<string, string> = {
  SOL: "bg-solana-purple",
  USDC: "bg-blue-400",
  mSOL: "bg-solana-teal",
  JUP: "bg-yellow-400",
};

const TOKEN_ICONS: Record<string, string> = {
  SOL: "◎",
  USDC: "$",
  mSOL: "◎̃",
  JUP: "⚡",
};

function HoldingRow({ holding }: { holding: PortfolioHolding }) {
  const isPositive = holding.change24h >= 0;
  const barColor = TOKEN_COLORS[holding.symbol] ?? "bg-slate-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${barColor} bg-opacity-20 text-white`}
          >
            {TOKEN_ICONS[holding.symbol] ?? holding.symbol[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{holding.symbol}</p>
            <p className="text-[10px] text-slate-500">
              {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              {holding.apy ? ` · ${holding.apy}% APY` : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-white">
            ${holding.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p
            className={`flex items-center justify-end gap-0.5 text-[10px] ${
              isPositive ? "text-solana-teal" : "text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            {isPositive ? "+" : ""}
            {holding.change24h.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Progress
          value={holding.allocation}
          indicatorClassName={barColor}
          className="h-1 flex-1"
        />
        <span className="w-9 text-right text-[10px] text-slate-500">
          {holding.allocation.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function PortfolioOverview() {
  const totalValue = PORTFOLIO.reduce((s, h) => s + h.valueUsd, 0);
  const totalChange = ((PORTFOLIO.reduce((s, h) => s + h.valueUsd * (h.change24h / 100), 0)) / totalValue) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-solana-teal" />
          <CardTitle>Portfolio</CardTitle>
        </div>
        <p className="text-xs text-slate-500 font-mono">9B2c…Mp7f</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Total */}
        <div className="rounded-xl bg-gradient-to-br from-solana-purple/10 to-solana-teal/10 border border-solana-border p-4">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Total Value</p>
          <p className="mt-1 text-2xl font-bold text-white">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p
            className={`flex items-center gap-0.5 text-xs mt-1 ${
              totalChange >= 0 ? "text-solana-teal" : "text-red-400"
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            {totalChange >= 0 ? "+" : ""}
            {totalChange.toFixed(2)}% today
          </p>
        </div>

        {/* Holdings */}
        <div className="space-y-3.5">
          {PORTFOLIO.map((h) => (
            <HoldingRow key={h.symbol} holding={h} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
