"use client";

import { RISK_SCORE, RISK_ALERTS, RiskAlert, formatTime } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Info, Shield, ShieldAlert } from "lucide-react";

function riskColor(score: number): string {
  if (score >= 70) return "bg-red-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-blue-400";
  return "bg-solana-teal";
}

function riskLabel(score: number): string {
  if (score >= 70) return "Critical";
  if (score >= 40) return "High";
  if (score >= 20) return "Medium";
  return "Low";
}

const ALERT_LEVEL_CONFIG = {
  critical: {
    variant: "danger" as const,
    icon: <ShieldAlert className="h-3.5 w-3.5 text-red-400" />,
    border: "border-red-500/30",
  },
  high: {
    variant: "danger" as const,
    icon: <AlertTriangle className="h-3.5 w-3.5 text-red-400" />,
    border: "border-red-500/20",
  },
  medium: {
    variant: "warning" as const,
    icon: <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />,
    border: "border-yellow-500/30",
  },
  low: {
    variant: "info" as const,
    icon: <Info className="h-3.5 w-3.5 text-blue-400" />,
    border: "border-blue-500/20",
  },
};

function AlertItem({ alert }: { alert: RiskAlert }) {
  const cfg = ALERT_LEVEL_CONFIG[alert.level];

  return (
    <div
      className={`rounded-lg border ${cfg.border} bg-slate-900/50 p-3 space-y-2 ${
        alert.resolved ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {cfg.icon}
          <span className="text-xs font-semibold text-white">{alert.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant={cfg.variant} className="text-[9px] px-1.5">
            {alert.level}
          </Badge>
          {alert.resolved && (
            <Badge variant="success" className="text-[9px] px-1.5">
              Resolved
            </Badge>
          )}
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-400">{alert.description}</p>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] text-slate-500">
          <span className="text-slate-400">Action:</span> {alert.action}
        </p>
        <p className="shrink-0 text-[10px] text-slate-600">{formatTime(alert.timestamp)}</p>
      </div>
    </div>
  );
}

export function RiskAssessmentPanel() {
  const overall = RISK_SCORE.overall;
  const overallLabel = riskLabel(overall);
  const activeAlerts = RISK_ALERTS.filter((a) => !a.resolved);
  const resolvedAlerts = RISK_ALERTS.filter((a) => a.resolved);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-solana-purple" />
            <CardTitle>Risk Assessment</CardTitle>
          </div>
          <Badge
            variant={overall >= 40 ? "warning" : "success"}
            className="text-xs"
          >
            {overallLabel} Risk
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          Powered by core SDK risk detectors · Updated 5m ago
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Overall score */}
        <div className="rounded-xl bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Portfolio Risk Score</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-white">{overall}</span>
                <span className="text-lg text-slate-500">/100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Status</p>
              <p className="text-sm font-semibold text-solana-teal">{overallLabel}</p>
            </div>
          </div>
          <Progress
            value={overall}
            indicatorClassName={riskColor(overall)}
            className="h-2.5"
          />
        </div>

        {/* Sub-scores */}
        <div className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Risk Breakdown</p>
          {[
            { label: "Concentration", value: RISK_SCORE.concentration, hint: "mSOL at 35%" },
            { label: "Volatility", value: RISK_SCORE.volatility, hint: "JUP whale activity" },
            { label: "Protocol", value: RISK_SCORE.protocol, hint: "Marinade, Orca: audited" },
            { label: "Liquidity", value: RISK_SCORE.liquidity, hint: "Orca LP position" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{item.hint}</span>
                  <span className="font-mono font-medium text-white">{item.value}/100</span>
                </div>
              </div>
              <Progress
                value={item.value}
                indicatorClassName={riskColor(item.value)}
                className="h-1.5"
              />
            </div>
          ))}
        </div>

        {/* Active alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Active Alerts ({activeAlerts.length})
            </p>
            {activeAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {/* Resolved alerts */}
        {resolvedAlerts.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-600">
              <CheckCircle2 className="h-3 w-3 text-solana-teal" />
              Resolved ({resolvedAlerts.length})
            </p>
            {resolvedAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
