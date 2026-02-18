"use client";

import { TRANSACTIONS, Transaction, formatTime, shortenSig } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Droplets,
  Lock,
  Unlock,
  XCircle,
  ExternalLink,
} from "lucide-react";

const TYPE_CONFIG = {
  swap: {
    label: "Swap",
    icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
    color: "text-solana-purple",
    bg: "bg-solana-purple/10",
  },
  stake: {
    label: "Stake",
    icon: <Lock className="h-3.5 w-3.5" />,
    color: "text-solana-teal",
    bg: "bg-solana-teal/10",
  },
  unstake: {
    label: "Unstake",
    icon: <Unlock className="h-3.5 w-3.5" />,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  transfer: {
    label: "Transfer",
    icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    color: "text-slate-400",
    bg: "bg-slate-700/40",
  },
  liquidity: {
    label: "LP",
    icon: <Droplets className="h-3.5 w-3.5" />,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
};

function StatusBadge({ status }: { status: Transaction["status"] }) {
  if (status === "success")
    return (
      <Badge variant="success" className="text-[9px] px-1.5 py-0">
        ✓ OK
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge variant="danger" className="text-[9px] px-1.5 py-0">
        ✗ Fail
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
      …
    </Badge>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const cfg = TYPE_CONFIG[tx.type];
  const isFailed = tx.status === "failed";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-800/50 ${
        isFailed ? "opacity-60" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ${cfg.color}`}
      >
        {cfg.icon}
      </div>

      {/* Description + sig */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-200">{tx.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[10px] text-slate-600">{shortenSig(tx.signature)}</span>
          <span className="text-[10px] text-slate-600">{tx.protocol}</span>
        </div>
      </div>

      {/* Amounts */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs font-medium text-white">
          {isFailed ? (
            <span className="flex items-center gap-1 text-red-400">
              <XCircle className="h-3 w-3" /> Blocked
            </span>
          ) : (
            <span>
              {tx.fromAmount} {tx.fromToken.length > 8 ? tx.fromToken.slice(0, 4) : tx.fromToken}
            </span>
          )}
        </p>
        {!isFailed && tx.toToken !== tx.fromToken && (
          <p className="text-[10px] text-slate-500">
            → {tx.toAmount} {tx.toToken.length > 8 ? tx.toToken.slice(0, 4) : tx.toToken}
          </p>
        )}
      </div>

      {/* Status + time */}
      <div className="shrink-0 text-right space-y-1">
        <StatusBadge status={tx.status} />
        <p className="text-[10px] text-slate-600">{formatTime(tx.blockTime)}</p>
      </div>
    </div>
  );
}

export function TransactionHistory() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <span className="text-[10px] text-slate-600 font-mono">
            Wallet: 9B2c…Mp7f
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Parsed by Solana Agent SDK · {TRANSACTIONS.length} recent transactions
        </p>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-0.5">
          {TRANSACTIONS.map((tx) => (
            <TxRow key={tx.signature} tx={tx} />
          ))}
        </div>
        <div className="mt-3 border-t border-slate-800 pt-3 text-center">
          <button className="flex items-center gap-1 mx-auto text-[11px] text-solana-purple hover:text-purple-300 transition-colors">
            View all on Solscan <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
