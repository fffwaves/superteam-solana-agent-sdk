"use client";

import { Activity, Github, ExternalLink } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-solana-border bg-solana-dark-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-solana-purple to-solana-teal">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Solana Agent SDK</span>
              <span className="ml-2 hidden text-[10px] text-slate-500 sm:inline">
                Dashboard
              </span>
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-solana-border bg-slate-900 px-3 py-1 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-solana-teal" />
              <span className="text-[11px] text-slate-400">3 agents live</span>
            </div>

            <a
              href="https://github.com/fffwaves/superteam"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-solana-border px-3 py-1.5 text-[11px] text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
            >
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
