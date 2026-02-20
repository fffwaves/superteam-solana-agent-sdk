"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  Info,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Sliders,
  Wallet,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SliderSetting {
  kind: "slider";
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  warnAbove?: number; // if value > warnAbove, show amber highlight
}

interface SelectSetting {
  kind: "select";
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string; desc?: string }[];
}

interface ToggleSetting {
  kind: "toggle";
  label: string;
  description: string;
  value: boolean;
}

type AnySettting = SliderSetting | SelectSetting | ToggleSetting;

interface SettingsSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  settings: Record<string, AnySettting>;
}

// ---------------------------------------------------------------------------
// Default settings
// ---------------------------------------------------------------------------

function defaultSections(): SettingsSection[] {
  return [
    {
      id: "executor",
      icon: <Shield className="h-3.5 w-3.5 text-solana-purple" />,
      title: "Safe Executor",
      subtitle: "Guardrails for on-chain execution",
      settings: {
        maxSlippage: {
          kind: "slider",
          label: "Max Slippage",
          description: "Reject swaps that exceed this slippage tolerance",
          value: 1.5,
          min: 0.1,
          max: 10,
          step: 0.1,
          unit: "%",
          warnAbove: 3,
        },
        maxPositionSize: {
          kind: "slider",
          label: "Max Position Size",
          description: "Cap on any single transaction amount",
          value: 500,
          min: 10,
          max: 5000,
          step: 10,
          unit: "USD",
          warnAbove: 2000,
        },
        maxDailyVolume: {
          kind: "slider",
          label: "Daily Volume Cap",
          description: "Total USD value the executor may transact per day",
          value: 2000,
          min: 100,
          max: 50000,
          step: 100,
          unit: "USD",
          warnAbove: 10000,
        },
        confirmationMode: {
          kind: "select",
          label: "Confirmation Mode",
          description: "When does the executor require human approval?",
          value: "above-threshold",
          options: [
            { value: "always", label: "Always ask", desc: "Human confirms every transaction" },
            {
              value: "above-threshold",
              label: "Above threshold",
              desc: "Auto-approve small txns, ask for large ones",
            },
            { value: "never", label: "Fully autonomous", desc: "No confirmation required (⚠️ risky)" },
          ],
        },
        simulateBeforeExecute: {
          kind: "toggle",
          label: "Simulate Before Execute",
          description: "Dry-run every transaction on Solana before broadcasting",
          value: true,
        },
        blockTestnetTokens: {
          kind: "toggle",
          label: "Block Testnet Tokens",
          description: "Reject transactions involving known testnet/fake tokens on mainnet",
          value: true,
        },
      },
    },
    {
      id: "agents",
      icon: <Bot className="h-3.5 w-3.5 text-solana-teal" />,
      title: "Agent Behavior",
      subtitle: "How often and how aggressively agents act",
      settings: {
        scanInterval: {
          kind: "select",
          label: "Scan Interval",
          description: "How frequently agents poll Solana RPC for new data",
          value: "30s",
          options: [
            { value: "10s", label: "10 seconds", desc: "High-frequency (more RPC costs)" },
            { value: "30s", label: "30 seconds", desc: "Balanced — recommended" },
            { value: "60s", label: "1 minute", desc: "Conservative (lower costs)" },
            { value: "300s", label: "5 minutes", desc: "Passive monitoring only" },
          ],
        },
        riskTolerance: {
          kind: "select",
          label: "Risk Tolerance",
          description: "Influences Yield Scout + Portfolio agent rebalancing decisions",
          value: "moderate",
          options: [
            { value: "conservative", label: "Conservative", desc: "Prefer stable positions, avoid high APY" },
            { value: "moderate", label: "Moderate", desc: "Balanced risk/yield — default" },
            { value: "aggressive", label: "Aggressive", desc: "Pursue highest yield, accept more risk" },
          ],
        },
        minConfidenceScore: {
          kind: "slider",
          label: "Min Decision Confidence",
          description: "Agent actions below this confidence score are skipped",
          value: 75,
          min: 40,
          max: 99,
          step: 1,
          unit: "%",
          warnAbove: 95,
        },
        autonomousRebalance: {
          kind: "toggle",
          label: "Autonomous Rebalancing",
          description: "Allow agents to rebalance portfolio without asking (within caps)",
          value: false,
        },
        pauseOnError: {
          kind: "toggle",
          label: "Pause Agents on Error",
          description: "Automatically pause all agents if a critical error occurs",
          value: true,
        },
      },
    },
    {
      id: "rpc",
      icon: <Globe className="h-3.5 w-3.5 text-blue-400" />,
      title: "Network & RPC",
      subtitle: "Solana endpoint and cluster configuration",
      settings: {
        cluster: {
          kind: "select",
          label: "Cluster",
          description: "Which Solana cluster agents connect to",
          value: "mainnet-beta",
          options: [
            { value: "mainnet-beta", label: "Mainnet Beta", desc: "Real funds — use carefully" },
            { value: "devnet", label: "Devnet", desc: "Test tokens, no real value" },
            { value: "testnet", label: "Testnet", desc: "Validator testing only" },
          ],
        },
        rpcEndpoint: {
          kind: "select",
          label: "RPC Endpoint",
          description: "Primary Solana JSON-RPC endpoint",
          value: "helius",
          options: [
            { value: "helius", label: "Helius (recommended)", desc: "High rate limits, Solana-optimized" },
            { value: "triton", label: "Triton RPC", desc: "Enterprise-grade, low latency" },
            { value: "alchemy", label: "Alchemy", desc: "Multi-chain, reliable uptime" },
            { value: "public", label: "Public RPC", desc: "Free but rate-limited — not for production" },
          ],
        },
        rpcRetries: {
          kind: "slider",
          label: "RPC Retry Attempts",
          description: "How many times to retry a failed RPC call before giving up",
          value: 3,
          min: 1,
          max: 10,
          step: 1,
          unit: "retries",
          warnAbove: 7,
        },
        priorityFee: {
          kind: "select",
          label: "Priority Fee",
          description: "Compute unit price for faster transaction inclusion",
          value: "dynamic",
          options: [
            { value: "none", label: "None", desc: "No priority fee (may be slow)" },
            { value: "dynamic", label: "Dynamic", desc: "Auto-calculate based on network load" },
            { value: "medium", label: "Medium fixed", desc: "0.001 SOL — reliable for most txns" },
            { value: "high", label: "High fixed", desc: "0.005 SOL — fast inclusion guaranteed" },
          ],
        },
      },
    },
    {
      id: "display",
      icon: <Sliders className="h-3.5 w-3.5 text-slate-400" />,
      title: "Display Preferences",
      subtitle: "Dashboard appearance and data presentation",
      settings: {
        currency: {
          kind: "select",
          label: "Base Currency",
          description: "Display portfolio values in this currency",
          value: "USD",
          options: [
            { value: "USD", label: "USD — US Dollar" },
            { value: "EUR", label: "EUR — Euro" },
            { value: "GBP", label: "GBP — British Pound" },
            { value: "SOL", label: "SOL — denominate in SOL" },
          ],
        },
        txHistoryLimit: {
          kind: "slider",
          label: "Transaction History Rows",
          description: "Number of transactions shown in the history panel",
          value: 10,
          min: 5,
          max: 50,
          step: 5,
          unit: "rows",
        },
        showTestnetBadge: {
          kind: "toggle",
          label: "Show Testnet Warning Badge",
          description: 'Display a "DEMO MODE" badge when connected to devnet/testnet',
          value: true,
        },
        compactNumbers: {
          kind: "toggle",
          label: "Compact Number Format",
          description: "Display 1,250,000 as 1.25M",
          value: true,
        },
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SliderRow({ setting, onChange }: { setting: SliderSetting; onChange: (v: number) => void }) {
  const isWarning = setting.warnAbove !== undefined && setting.value > setting.warnAbove;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-white">{setting.label}</p>
          {isWarning && (
            <Badge variant="warning" className="text-[9px] py-0">
              ⚠ high
            </Badge>
          )}
        </div>
        <span
          className={`text-xs font-mono font-semibold ${
            isWarning ? "text-yellow-400" : "text-solana-purple"
          }`}
        >
          {setting.value}
          {setting.unit}
        </span>
      </div>
      <p className="text-[10px] text-slate-500">{setting.description}</p>
      <input
        type="range"
        min={setting.min}
        max={setting.max}
        step={setting.step}
        value={setting.value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 appearance-none rounded-full bg-slate-700 accent-solana-purple cursor-pointer"
      />
      <div className="flex justify-between text-[9px] text-slate-600">
        <span>
          {setting.min}
          {setting.unit}
        </span>
        <span>
          {setting.max}
          {setting.unit}
        </span>
      </div>
    </div>
  );
}

function SelectRow({
  setting,
  onChange,
}: {
  setting: SelectSetting;
  onChange: (v: string) => void;
}) {
  const current = setting.options.find((o) => o.value === setting.value);
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-white">{setting.label}</p>
      <p className="text-[10px] text-slate-500">{setting.description}</p>
      <div className="mt-1.5 grid gap-1">
        {setting.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
              setting.value === opt.value
                ? "border-solana-purple/40 bg-solana-purple/10"
                : "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div
              className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 flex items-center justify-center ${
                setting.value === opt.value
                  ? "border-solana-purple bg-solana-purple"
                  : "border-slate-600"
              }`}
            >
              {setting.value === opt.value && (
                <Check className="h-2 w-2 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white">{opt.label}</p>
              {opt.desc && <p className="text-[10px] text-slate-500">{opt.desc}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  setting,
  onChange,
}: {
  setting: ToggleSetting;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white">{setting.label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{setting.description}</p>
      </div>
      <button
        onClick={() => onChange(!setting.value)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          setting.value ? "bg-solana-purple" : "bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
            setting.value ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsSectionBlock({
  section,
  onChangeSetting,
}: {
  section: SettingsSection;
  onChangeSetting: (sectionId: string, settingKey: string, value: unknown) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {section.icon}
          <div className="text-left">
            <p className="text-xs font-semibold text-white">{section.title}</p>
            <p className="text-[10px] text-slate-500">{section.subtitle}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        )}
      </button>

      {/* Settings rows */}
      {expanded && (
        <div className="border-t border-slate-800 divide-y divide-slate-800/50">
          {Object.entries(section.settings).map(([key, setting]) => (
            <div key={key} className="px-4 py-3">
              {setting.kind === "slider" && (
                <SliderRow
                  setting={setting}
                  onChange={(v) => onChangeSetting(section.id, key, v)}
                />
              )}
              {setting.kind === "select" && (
                <SelectRow
                  setting={setting}
                  onChange={(v) => onChangeSetting(section.id, key, v)}
                />
              )}
              {setting.kind === "toggle" && (
                <ToggleRow
                  setting={setting}
                  onChange={(v) => onChangeSetting(section.id, key, v)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SettingsPanel() {
  const [sections, setSections] = useState<SettingsSection[]>(defaultSections);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  function handleChangeSetting(sectionId: string, settingKey: string, value: number | string | boolean) {
    setSections((prev) =>
      prev.map((s): SettingsSection => {
        if (s.id !== sectionId) return s;
        const existing = s.settings[settingKey];
        // Cast the updated setting back to the correct union member
        const updated = { ...existing, value } as AnySettting;
        return {
          ...s,
          settings: {
            ...s.settings,
            [settingKey]: updated,
          },
        };
      })
    );
    setDirty(true);
    setSaved(false);
  }

  function handleSave() {
    // In a real app this would persist to localStorage / API
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setSections(defaultSections());
    setDirty(false);
    setSaved(false);
  }

  // Count "warning" settings across all sections
  const warningCount = sections.reduce((acc, section) => {
    return (
      acc +
      Object.values(section.settings).filter((s) => {
        if (s.kind !== "slider") return false;
        return s.warnAbove !== undefined && s.value > s.warnAbove;
      }).length
    );
  }, 0);

  return (
    <Card className="bg-solana-card-bg border-solana-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-sm font-semibold text-white">Settings</CardTitle>
            {warningCount > 0 && (
              <Badge variant="warning" className="text-[10px]">
                {warningCount} warning{warningCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Save / Reset bar */}
          <div className="flex items-center gap-1.5">
            {dirty && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!dirty}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                dirty
                  ? "border-solana-purple/40 bg-solana-purple/10 text-solana-purple hover:bg-solana-purple/20"
                  : "border-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-3 w-3" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-blue-500/20 bg-blue-950/20 px-3 py-2">
          <Info className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-300/70">
            Settings apply to all three reference agents (Portfolio Tracker, Yield Scout, Risk Monitor). 
            Changes take effect on the next agent scan cycle. This is a live demo — values reset on page reload.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {sections.map((section) => (
          <SettingsSectionBlock
            key={section.id}
            section={section}
            onChangeSetting={handleChangeSetting}
          />
        ))}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <Cpu className="h-3 w-3" />
            <span>SDK v0.1.0</span>
            <span>·</span>
            <Wallet className="h-3 w-3" />
            <span>Mainnet Beta</span>
            <span>·</span>
            <Zap className="h-3 w-3" />
            <span>Helius RPC</span>
          </div>
          {dirty && (
            <p className="text-[10px] text-yellow-500/70">Unsaved changes</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
