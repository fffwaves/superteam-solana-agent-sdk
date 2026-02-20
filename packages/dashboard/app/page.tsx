import { Header } from "@/components/Header";
import { AgentStatusCard } from "@/components/AgentStatusCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { RiskAssessmentPanel } from "@/components/RiskAssessmentPanel";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { PerformanceChart } from "@/components/PerformanceChart";
import { AlertManagement } from "@/components/AlertManagement";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AGENTS } from "@/lib/mock-data";
import { Activity, BookOpen, Code2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-solana-dark-bg">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Page intro */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Agent Control Center</h1>
            <p className="text-xs text-slate-500">
              3 autonomous agents monitoring your Solana portfolio in real-time
            </p>
          </div>
          {/* Quick links */}
          <div className="flex gap-2">
            <a
              href="https://github.com/fffwaves/superteam/blob/master/docs/quickstart.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-solana-border px-3 py-1.5 text-[11px] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Quickstart
            </a>
            <a
              href="https://github.com/fffwaves/superteam/blob/master/docs/api.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-solana-border px-3 py-1.5 text-[11px] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Code2 className="h-3.5 w-3.5" />
              API Docs
            </a>
          </div>
        </div>

        {/* SDK feature strip */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Transaction Parser", desc: "Jupiter, Marinade, Orca, SPL" },
            { label: "Risk Detector", desc: "Rug pulls, MEV, patterns" },
            { label: "Safe Executor", desc: "Simulate, confirm, guardrails" },
            { label: "Decision Engine", desc: "Weighted analyzers, reasoning log" },
          ].map((feat) => (
            <div
              key={feat.label}
              className="rounded-lg border border-solana-border bg-solana-card-bg p-3"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="h-3 w-3 text-solana-purple" />
                <p className="text-[11px] font-semibold text-white">{feat.label}</p>
              </div>
              <p className="text-[10px] text-slate-500">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Agents row */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reference Agents
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {AGENTS.map((agent) => (
              <AgentStatusCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* Main content grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: Transaction history (spans 2 cols) */}
          <div className="lg:col-span-2">
            <TransactionHistory />
          </div>

          {/* Right: Portfolio + Risk */}
          <div className="space-y-4">
            <PortfolioOverview />
          </div>
        </div>

        {/* Performance chart full-width */}
        <PerformanceChart />

        {/* Alert management + Risk assessment side by side on large screens */}
        <div className="grid gap-4 lg:grid-cols-2">
          <AlertManagement />
          <RiskAssessmentPanel />
        </div>

        {/* Settings panel — full width */}
        <SettingsPanel />

        {/* Footer */}
        <footer className="border-t border-solana-border pt-4 pb-6 text-center">
          <p className="text-[11px] text-slate-600">
            Built autonomously by{" "}
            <span className="text-solana-purple">WavesAI</span> ·{" "}
            <a
              href="https://github.com/fffwaves/superteam"
              className="hover:text-slate-400 transition-colors"
            >
              Open source (MIT)
            </a>{" "}
            · Superteam Open Innovation Track 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
