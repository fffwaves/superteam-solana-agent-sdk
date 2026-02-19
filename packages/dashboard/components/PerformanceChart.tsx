"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PORTFOLIO_HISTORY, AGENT_PERFORMANCE, AgentPerformance } from "@/lib/mock-data";
import { TrendingUp, Activity, Target } from "lucide-react";

// ---------------------------------------------------------------------------
// SVG Line Chart — pure, zero-dependency
// ---------------------------------------------------------------------------

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: string;
}

interface SvgLineChartProps {
  series: { id: string; color: string; points: ChartPoint[] }[];
  height?: number;
  showGrid?: boolean;
  yFormat?: (v: number) => string;
}

function SvgLineChart({ series, height = 120, showGrid = true }: SvgLineChartProps) {
  const [hovered, setHovered] = useState<{ seriesId: string; idx: number } | null>(null);
  const W = 600;
  const H = height;
  const PAD = { top: 8, right: 12, bottom: 20, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Flatten all values to find domain
  const allValues = series.flatMap((s) => s.points.map((p) => p.y));
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const rangeY = maxY - minY || 1;

  const numPoints = series[0]?.points.length ?? 1;
  const xScale = (i: number) => PAD.left + (i / (numPoints - 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - ((v - minY) / rangeY) * innerH;

  const toPath = (points: ChartPoint[]) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(p.y).toFixed(1)}`)
      .join(" ");

  const toArea = (points: ChartPoint[], color: string) => {
    const linePath = toPath(points);
    const lastX = xScale(points.length - 1).toFixed(1);
    const firstX = xScale(0).toFixed(1);
    return `${linePath} L ${lastX} ${(PAD.top + innerH).toFixed(1)} L ${firstX} ${(PAD.top + innerH).toFixed(1)} Z`;
  };

  // Grid lines (5 horizontal)
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const v = minY + (rangeY * i) / 4;
    const y = yScale(v);
    return { y, label: v.toFixed(1) };
  });

  // X-axis labels (every 7 days)
  const xLabels = series[0]?.points
    .map((p, i) => ({ i, label: p.label }))
    .filter((_, i) => i % 7 === 0 || i === numPoints - 1) ?? [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        {series.map((s) => (
          <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
          </linearGradient>
        ))}
      </defs>

      {/* Grid */}
      {showGrid &&
        gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={gl.y}
              x2={W - PAD.right}
              y2={gl.y}
              stroke="#1e293b"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 4}
              y={gl.y + 3}
              textAnchor="end"
              fontSize="9"
              fill="#475569"
            >
              {gl.label}
            </text>
          </g>
        ))}

      {/* X labels */}
      {xLabels.map(({ i, label }) => (
        <text
          key={i}
          x={xScale(i)}
          y={H - 2}
          textAnchor="middle"
          fontSize="8"
          fill="#475569"
        >
          {label}
        </text>
      ))}

      {/* Area fills */}
      {series.map((s) => (
        <path
          key={`area-${s.id}`}
          d={toArea(s.points, s.color)}
          fill={`url(#grad-${s.id})`}
        />
      ))}

      {/* Lines */}
      {series.map((s) => (
        <path
          key={`line-${s.id}`}
          d={toPath(s.points)}
          fill="none"
          stroke={s.color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* Hover dots + tooltips */}
      {series.map((s) =>
        s.points.map((p, i) => {
          const isHov = hovered?.seriesId === s.id && hovered?.idx === i;
          return (
            <g key={`dot-${s.id}-${i}`}>
              <circle
                cx={xScale(i)}
                cy={yScale(p.y)}
                r={isHov ? 4 : 0}
                fill={s.color}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {isHov && (
                <g>
                  <rect
                    x={Math.min(xScale(i) + 6, W - PAD.right - 70)}
                    y={yScale(p.y) - 18}
                    width={66}
                    height={20}
                    rx="3"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="0.5"
                  />
                  <text
                    x={Math.min(xScale(i) + 39, W - PAD.right - 35)}
                    y={yScale(p.y) - 5}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#f8fafc"
                  >
                    {p.value}
                  </text>
                </g>
              )}
              {/* Invisible hit area */}
              <rect
                x={xScale(i) - 8}
                y={PAD.top}
                width={16}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHovered({ seriesId: s.id, idx: i })}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "crosshair" }}
              />
            </g>
          );
        })
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Stat pill
// ---------------------------------------------------------------------------
function StatBadge({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-wide text-slate-500">{label}</span>
      <span
        className={`text-sm font-bold ${
          positive === undefined
            ? "text-white"
            : positive
            ? "text-solana-teal"
            : "text-red-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent row
// ---------------------------------------------------------------------------
function AgentPerfRow({ agent }: { agent: AgentPerformance }) {
  const pnlPos = agent.totalPnlPercent >= 0;
  return (
    <div className="rounded-lg border border-solana-border bg-solana-card-bg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: agent.color }}
          />
          <span className="text-xs font-semibold text-white">{agent.agentName}</span>
        </div>
        <span
          className={`text-xs font-bold ${pnlPos ? "text-solana-teal" : "text-red-400"}`}
        >
          {pnlPos ? "+" : ""}
          {agent.totalPnlPercent}%
        </span>
      </div>

      {/* Mini sparkline */}
      <SvgLineChart
        height={48}
        showGrid={false}
        series={[
          {
            id: agent.agentId,
            color: agent.color,
            points: agent.history.map((h) => ({
              x: h.day,
              y: h.pnl,
              label: h.date,
              value: `${h.pnl >= 0 ? "+" : ""}${h.pnl.toFixed(1)}%`,
            })),
          },
        ]}
      />

      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-solana-border">
        <StatBadge label="Win Rate" value={`${agent.winRate}%`} positive />
        <StatBadge label="Decisions" value={agent.totalDecisions.toString()} />
        <StatBadge label="Avg Conf" value={`${agent.avgConfidence}%`} positive />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function PerformanceChart() {
  const [tab, setTab] = useState<"portfolio" | "agents">("portfolio");

  // Portfolio P&L series
  const portfolioSeries = [
    {
      id: "portfolio",
      color: "#9945FF",
      points: PORTFOLIO_HISTORY.map((p) => ({
        x: p.day,
        y: p.pnlPercent,
        label: p.date,
        value: `${p.pnlPercent >= 0 ? "+" : ""}${p.pnlPercent}% ($${p.portfolioValue.toLocaleString()})`,
      })),
    },
  ];

  // Decision accuracy series (all agents overlaid)
  const accuracySeries = AGENT_PERFORMANCE.map((a) => ({
    id: a.agentId,
    color: a.color,
    points: a.history.map((h) => ({
      x: h.day,
      y: h.accuracy,
      label: h.date,
      value: `${a.agentName}: ${h.accuracy}%`,
    })),
  }));

  const latestValue = PORTFOLIO_HISTORY[PORTFOLIO_HISTORY.length - 1].portfolioValue;
  const startValue = PORTFOLIO_HISTORY[0].portfolioValue;
  const totalPnl = PORTFOLIO_HISTORY[PORTFOLIO_HISTORY.length - 1].pnlPercent;
  const totalDecisions = AGENT_PERFORMANCE.reduce((s, a) => s + a.totalDecisions, 0);
  const avgWinRate = Math.round(
    AGENT_PERFORMANCE.reduce((s, a) => s + a.winRate, 0) / AGENT_PERFORMANCE.length
  );

  return (
    <Card className="border-solana-border bg-solana-card-bg">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-solana-purple" />
            <CardTitle className="text-sm font-semibold text-white">
              Performance — 30 Days
            </CardTitle>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-solana-border p-0.5 w-fit">
            {(["portfolio", "agents"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${
                  tab === t
                    ? "bg-solana-purple text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t === "portfolio" ? "Portfolio P&L" : "Agent Accuracy"}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-5 pt-1">
          <StatBadge
            label="Total P&L"
            value={`+${totalPnl}%`}
            positive={totalPnl >= 0}
          />
          <StatBadge
            label="Portfolio Value"
            value={`$${latestValue.toLocaleString()}`}
          />
          <StatBadge
            label="Total Decisions"
            value={totalDecisions.toString()}
          />
          <StatBadge
            label="Avg Win Rate"
            value={`${avgWinRate}%`}
            positive
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {tab === "portfolio" ? (
          <>
            <div className="rounded-lg border border-solana-border bg-[#0a0f1a] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-slate-500">
                Cumulative P&L %
              </p>
              <SvgLineChart height={140} series={portfolioSeries} />
            </div>

            <div className="rounded-lg border border-solana-border bg-[#0a0f1a] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-slate-500">
                Daily Decisions
              </p>
              <SvgLineChart
                height={80}
                showGrid={false}
                series={[
                  {
                    id: "decisions",
                    color: "#14F195",
                    points: PORTFOLIO_HISTORY.map((p) => ({
                      x: p.day,
                      y: p.decisions,
                      label: p.date,
                      value: `${p.decisions} decisions (${p.successRate}% accuracy)`,
                    })),
                  },
                ]}
              />
            </div>
          </>
        ) : (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {AGENT_PERFORMANCE.map((a) => (
                <div key={a.agentId} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-4 rounded-full"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="text-[10px] text-slate-400">{a.agentName}</span>
                </div>
              ))}
            </div>

            {/* Overlaid accuracy chart */}
            <div className="rounded-lg border border-solana-border bg-[#0a0f1a] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-slate-500">
                Decision Accuracy % (30d)
              </p>
              <SvgLineChart height={140} series={accuracySeries} />
            </div>

            {/* Per-agent breakdown */}
            <div className="grid gap-3 sm:grid-cols-3">
              {AGENT_PERFORMANCE.map((a) => (
                <AgentPerfRow key={a.agentId} agent={a} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
