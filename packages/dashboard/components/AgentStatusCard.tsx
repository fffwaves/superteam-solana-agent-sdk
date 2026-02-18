"use client";

import { AgentCard, formatTime, formatFutureTime } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
} from "lucide-react";

const STATUS_CONFIG = {
  running: {
    label: "Running",
    variant: "success" as const,
    icon: <Activity className="h-3 w-3 animate-pulse" />,
    dot: "bg-solana-teal animate-pulse",
  },
  idle: {
    label: "Idle",
    variant: "idle" as const,
    icon: <Clock className="h-3 w-3" />,
    dot: "bg-slate-500",
  },
  alert: {
    label: "Alert",
    variant: "warning" as const,
    icon: <AlertTriangle className="h-3 w-3" />,
    dot: "bg-yellow-400 animate-pulse",
  },
  error: {
    label: "Error",
    variant: "danger" as const,
    icon: <AlertTriangle className="h-3 w-3" />,
    dot: "bg-red-500 animate-pulse",
  },
};

const AGENT_ICONS: Record<string, React.ReactNode> = {
  "portfolio-tracker": <Bot className="h-5 w-5 text-solana-purple" />,
  "yield-scout": <Zap className="h-5 w-5 text-solana-teal" />,
  "risk-monitor": <AlertTriangle className="h-5 w-5 text-yellow-400" />,
};

function TrendIcon({ trend }: { trend?: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-solana-teal" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-slate-500" />;
}

interface AgentStatusCardProps {
  agent: AgentCard;
}

export function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const statusCfg = STATUS_CONFIG[agent.status];
  const confidencePct = Math.round(agent.decisionConfidence * 100);

  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
              {AGENT_ICONS[agent.id] ?? <Bot className="h-5 w-5 text-slate-400" />}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{agent.name}</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">{agent.description}</p>
            </div>
          </div>
          <Badge variant={statusCfg.variant} className="flex shrink-0 items-center gap-1">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {agent.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-slate-900/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{metric.label}</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm font-semibold text-white">{metric.value}</span>
                {metric.trend && <TrendIcon trend={metric.trend} />}
              </div>
              {metric.trendValue && (
                <p
                  className={`text-[10px] ${
                    metric.trend === "up"
                      ? "text-solana-teal"
                      : metric.trend === "down"
                      ? "text-red-400"
                      : "text-slate-500"
                  }`}
                >
                  {metric.trendValue}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Last decision */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <p className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
            <CheckCircle2 className="h-3 w-3 text-solana-teal" />
            Last Decision
            <span className="ml-auto font-mono text-[10px] text-slate-600">
              {confidencePct}% conf.
            </span>
          </p>
          <p className="line-clamp-4 text-xs leading-relaxed text-slate-300">{agent.lastDecision}</p>
        </div>

        {/* Footer: run stats */}
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <span>Last run: {formatTime(agent.lastRun)}</span>
          <span className="text-slate-700">·</span>
          <span>Next: {formatFutureTime(agent.nextRun)}</span>
          <span className="text-slate-700">·</span>
          <span>{agent.runsToday} runs today</span>
          {agent.alertCount > 0 && (
            <>
              <span className="text-slate-700">·</span>
              <span className="text-yellow-400">{agent.alertCount} alert{agent.alertCount !== 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
