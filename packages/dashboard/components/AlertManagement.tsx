"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RISK_ALERTS, RiskAlert, RiskLevel, formatTime } from "@/lib/mock-data";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AlertConfig {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  threshold?: number;
  thresholdLabel?: string;
  thresholdMin?: number;
  thresholdMax?: number;
  thresholdStep?: number;
}

interface MutedAlert {
  id: string;
  mutedUntil: number; // unix timestamp
}

// ---------------------------------------------------------------------------
// Initial alert configuration rules
// ---------------------------------------------------------------------------

const INITIAL_CONFIGS: AlertConfig[] = [
  {
    id: "whale-activity",
    label: "Whale Activity",
    description: "Alert when large wallets (>100k tokens) execute significant moves",
    enabled: true,
    threshold: 3,
    thresholdLabel: "Min whales",
    thresholdMin: 1,
    thresholdMax: 10,
    thresholdStep: 1,
  },
  {
    id: "concentration",
    label: "Concentration Risk",
    description: "Alert when a single asset exceeds target allocation",
    enabled: true,
    threshold: 40,
    thresholdLabel: "Max allocation %",
    thresholdMin: 20,
    thresholdMax: 80,
    thresholdStep: 5,
  },
  {
    id: "slippage",
    label: "High Slippage",
    description: "Alert when swap slippage exceeds safe limit",
    enabled: true,
    threshold: 2,
    thresholdLabel: "Max slippage %",
    thresholdMin: 0.5,
    thresholdMax: 10,
    thresholdStep: 0.5,
  },
  {
    id: "rug-risk",
    label: "Rug Pull Risk",
    description: "Alert on suspicious token patterns (dev wallet drains, LP removals)",
    enabled: true,
  },
  {
    id: "mev-exposure",
    label: "MEV Exposure",
    description: "Alert when Jito bundle frontrunning is detected on your txns",
    enabled: false,
  },
  {
    id: "yield-drop",
    label: "Yield Drop",
    description: "Alert when a staking position's APY falls below expected range",
    enabled: true,
    threshold: 5,
    thresholdLabel: "Min APY %",
    thresholdMin: 1,
    thresholdMax: 20,
    thresholdStep: 0.5,
  },
  {
    id: "failed-tx",
    label: "Failed Transactions",
    description: "Alert on any transaction blocked by the Safe Executor guardrails",
    enabled: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function levelColor(level: RiskLevel) {
  return {
    critical: "border-red-500/40 bg-red-950/20",
    high: "border-red-400/30 bg-red-900/10",
    medium: "border-yellow-500/30 bg-yellow-950/10",
    low: "border-blue-500/20 bg-blue-950/10",
  }[level];
}

function levelBadge(level: RiskLevel) {
  return {
    critical: "danger",
    high: "danger",
    medium: "warning",
    low: "info",
  }[level] as "danger" | "warning" | "info";
}

function levelIcon(level: RiskLevel) {
  const cls = {
    critical: "text-red-400",
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-blue-400",
  }[level];
  if (level === "critical") return <ShieldAlert className={`h-3.5 w-3.5 ${cls}`} />;
  if (level === "high") return <AlertTriangle className={`h-3.5 w-3.5 ${cls}`} />;
  if (level === "medium") return <AlertTriangle className={`h-3.5 w-3.5 ${cls}`} />;
  return <Info className={`h-3.5 w-3.5 ${cls}`} />;
}

function formatMutedUntil(ts: number): string {
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "expired";
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AlertRow({
  alert,
  isMuted,
  mutedUntil,
  onMute,
  onResolve,
  onUnmute,
}: {
  alert: RiskAlert;
  isMuted: boolean;
  mutedUntil?: number;
  onMute: (id: string, hours: number) => void;
  onResolve: (id: string) => void;
  onUnmute: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMuteMenu, setShowMuteMenu] = useState(false);

  const muteOptions = [
    { label: "1 hour", hours: 1 },
    { label: "4 hours", hours: 4 },
    { label: "24 hours", hours: 24 },
    { label: "1 week", hours: 168 },
  ];

  return (
    <div
      className={`rounded-lg border ${levelColor(alert.level)} ${
        alert.resolved || isMuted ? "opacity-50" : ""
      } transition-opacity`}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 p-3">
        <div className="mt-0.5 shrink-0">{levelIcon(alert.level)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-white">{alert.title}</span>
            <Badge variant={levelBadge(alert.level)} className="text-[10px] uppercase tracking-wide">
              {alert.level}
            </Badge>
            {alert.resolved && (
              <Badge variant="success" className="text-[10px]">
                Resolved
              </Badge>
            )}
            {isMuted && mutedUntil && (
              <Badge variant="outline" className="text-[10px]">
                Muted · {formatMutedUntil(mutedUntil)}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {alert.source} · {formatTime(alert.timestamp)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          {!alert.resolved && !isMuted && (
            <>
              {/* Mute dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMuteMenu(!showMuteMenu)}
                  className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                >
                  <BellOff className="h-3 w-3" />
                  Mute
                </button>
                {showMuteMenu && (
                  <div className="absolute right-0 top-7 z-10 w-32 rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
                    {muteOptions.map((opt) => (
                      <button
                        key={opt.hours}
                        onClick={() => {
                          onMute(alert.id, opt.hours);
                          setShowMuteMenu(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white first:rounded-t-lg last:rounded-b-lg"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Resolve */}
              <button
                onClick={() => onResolve(alert.id)}
                className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:text-solana-teal hover:border-solana-teal/40 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" />
                Resolve
              </button>
            </>
          )}
          {isMuted && (
            <button
              onClick={() => onUnmute(alert.id)}
              className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:text-white transition-colors"
            >
              <Bell className="h-3 w-3" />
              Unmute
            </button>
          )}
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-md p-1 text-slate-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-800/60 px-3 pb-3 pt-2 space-y-2">
          <p className="text-[11px] text-slate-400">{alert.description}</p>
          <div className="rounded-md border border-slate-800 bg-slate-950/50 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 mb-1">
              Recommended Action
            </p>
            <p className="text-[11px] text-slate-300">{alert.action}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigRow({
  config,
  onChange,
}: {
  config: AlertConfig;
  onChange: (id: string, patch: Partial<AlertConfig>) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white">{config.label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{config.description}</p>
        </div>
        {/* Toggle */}
        <button
          onClick={() => onChange(config.id, { enabled: !config.enabled })}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
            config.enabled ? "bg-solana-purple" : "bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
              config.enabled ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {/* Threshold slider */}
      {config.threshold !== undefined && config.enabled && (
        <div className="flex items-center gap-3">
          <label className="text-[10px] text-slate-500 w-28 shrink-0">
            {config.thresholdLabel}: <span className="text-white font-semibold">{config.threshold}</span>
          </label>
          <input
            type="range"
            min={config.thresholdMin}
            max={config.thresholdMax}
            step={config.thresholdStep}
            value={config.threshold}
            onChange={(e) => onChange(config.id, { threshold: parseFloat(e.target.value) })}
            className="flex-1 h-1 appearance-none rounded-full bg-slate-700 accent-solana-purple cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AlertManagement() {
  const [activeTab, setActiveTab] = useState<"active" | "history" | "configure">("active");
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");
  const [alerts, setAlerts] = useState<RiskAlert[]>(() => [
    ...RISK_ALERTS,
    // Seed a few extra alerts for richer demo
    {
      id: "alert-004",
      level: "high" as RiskLevel,
      title: "Rug Risk: New Token in Watchlist",
      description:
        "SOLTUNA token added to your watchlist shows 3 rug-pull indicators: LP token unlocked, dev wallet holds 42% supply, contract upgraded in past 24h.",
      timestamp: Math.floor(Date.now() / 1000) - 7200,
      resolved: false,
      source: "Risk Monitor",
      action: "Do not buy. Consider removing from watchlist to reduce noise.",
    },
    {
      id: "alert-005",
      level: "low" as RiskLevel,
      title: "Yield Opportunity: Orca SOL/mSOL",
      description:
        "Orca SOL/mSOL concentrated pool current APY jumped to 14.2% (was 9.1% yesterday). Fee tier: 0.04%. Your mSOL position is eligible to be deployed here.",
      timestamp: Math.floor(Date.now() / 1000) - 10800,
      resolved: true,
      source: "Yield Scout",
      action: "Yield Scout will auto-rebalance if APY holds above 12% for 2h.",
    },
  ]);
  const [muted, setMuted] = useState<MutedAlert[]>([]);
  const [configs, setConfigs] = useState<AlertConfig[]>(INITIAL_CONFIGS);

  // Derived
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);
  const isMuted = useCallback(
    (id: string) => {
      const m = muted.find((m) => m.id === id);
      return m ? m.mutedUntil > Math.floor(Date.now() / 1000) : false;
    },
    [muted]
  );
  const getMutedUntil = (id: string) => muted.find((m) => m.id === id)?.mutedUntil;

  // Filtered list for active tab
  const displayedActive = activeAlerts.filter(
    (a) => filter === "all" || a.level === filter
  );

  const unreadCount = activeAlerts.filter((a) => !isMuted(a.id)).length;

  // Actions
  function handleMute(id: string, hours: number) {
    const mutedUntil = Math.floor(Date.now() / 1000) + hours * 3600;
    setMuted((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      return [...filtered, { id, mutedUntil }];
    });
  }

  function handleUnmute(id: string) {
    setMuted((prev) => prev.filter((m) => m.id !== id));
  }

  function handleResolve(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  }

  function handleConfigChange(id: string, patch: Partial<AlertConfig>) {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleClearAll() {
    setAlerts((prev) => prev.map((a) => ({ ...a, resolved: true })));
  }

  const tabs = [
    { id: "active" as const, label: "Active", count: unreadCount },
    { id: "history" as const, label: "History", count: resolvedAlerts.length },
    { id: "configure" as const, label: "Configure", count: configs.filter((c) => c.enabled).length },
  ];

  const LEVEL_FILTERS: Array<"all" | RiskLevel> = ["all", "critical", "high", "medium", "low"];

  return (
    <Card className="bg-solana-card-bg border-solana-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-solana-purple" />
            <CardTitle className="text-sm font-semibold text-white">Alert Management</CardTitle>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {activeTab === "active" && activeAlerts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
                Resolve All
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 rounded-lg bg-slate-900/60 p-0.5 mt-2 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1 text-[10px] ${
                  activeTab === tab.id ? "bg-slate-700 text-slate-300" : "bg-slate-800 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ACTIVE TAB */}
        {activeTab === "active" && (
          <>
            {/* Level filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3 w-3 text-slate-600" />
              {LEVEL_FILTERS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors capitalize ${
                    filter === lvl
                      ? "bg-solana-purple/20 text-solana-purple border border-solana-purple/30"
                      : "border border-slate-700 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {displayedActive.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-solana-teal/40" />
                <p className="text-xs text-slate-500">No active alerts</p>
                <p className="text-[10px] text-slate-600">Agents are running clean</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedActive.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    isMuted={isMuted(alert.id)}
                    mutedUntil={getMutedUntil(alert.id)}
                    onMute={handleMute}
                    onResolve={handleResolve}
                    onUnmute={handleUnmute}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <>
            {resolvedAlerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Shield className="h-8 w-8 text-slate-700" />
                <p className="text-xs text-slate-500">No resolved alerts yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resolvedAlerts.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    isMuted={false}
                    onMute={() => {}}
                    onResolve={() => {}}
                    onUnmute={() => {}}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* CONFIGURE TAB */}
        {activeTab === "configure" && (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <SlidersHorizontal className="h-3 w-3 text-slate-500" />
              <p className="text-[11px] text-slate-500">
                {configs.filter((c) => c.enabled).length} of {configs.length} rules enabled
              </p>
            </div>
            <div className="space-y-2">
              {configs.map((config) => (
                <ConfigRow key={config.id} config={config} onChange={handleConfigChange} />
              ))}
            </div>
            <p className="text-[10px] text-slate-600 pt-1">
              Configuration changes take effect immediately for new alerts.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
