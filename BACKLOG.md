# BACKLOG.md — Full Feature Inventory

**Project:** Solana Agent SDK  
**Source of Truth:** This file tracks all features + tiers throughout project lifecycle  

---

## Tier 1: MVP (Core Functionality) — MUST SHIP

### Core SDK Modules
- [ ] 🟢 Transaction Parser (SPL, Jupiter, Marinade, Orca, Magic Eden, Raydium)
- [ ] 🟢 Risk Detector (rug pulls, suspicious patterns, MEV assessment)
- [ ] 🟢 Safe Executor (confirmation flows, guardrails, simulation)
- [ ] 🟢 Decision Framework (reasoning logging, structured decisions)
- [ ] 🟢 API Design (unified interface, examples)

### Reference Agents
- [ ] 🟢 Portfolio Tracker Agent (monitor, P&L, risks)
- [ ] 🟢 Yield Scout Agent (monitor APY, recommend swaps)
- [ ] 🟢 Risk Monitor Agent (watch for exploits, alerts)

### Basic Dashboard
- [ ] 🟢 Vercel deployment (Next.js + shadcn/ui)
- [ ] 🟢 Transaction history display
- [ ] 🟢 Agent status display
- [ ] 🟢 Risk assessment view

### Documentation
- [ ] 🟢 API documentation
- [ ] 🟢 Quick-start guide
- [ ] 🟢 Deployment instructions (local + live)
- [ ] 🟢 Build-log.md (agent decision narrative)
- [ ] 🟢 README (submission narrative)

### GitHub + Licensing
- [ ] 🟢 Public repo (fffwaves/superteam)
- [ ] 🟢 MIT license
- [ ] 🟢 Clear instructions to run/reproduce

---

## Tier 2: Enhanced MVP (Advanced Features) — NICE TO HAVE

### Advanced SDK Features
- [ ] 🟡 Custom analyzer framework (extensibility for community)
- [ ] 🟡 Autonomous rebalancing (agent can execute swaps to maintain target allocation)
- [ ] 🟡 Performance tracking (P&L, win rate, decision accuracy metrics)
- [ ] 🟡 Portfolio optimization (suggest asset allocation based on risk/yield)
- [ ] 🟡 Tax calculation (cost basis tracking, gain/loss reporting)

### Advanced Agents
- [ ] 🟡 Arbitrage Agent (detect cross-DEX opportunities, execute)
- [ ] 🟡 Swing Trading Agent (detect price trends, execute tactical swaps)
- [ ] 🟡 Community-contributed agents (examples for extensibility)
- [ ] 🟡 **Phantom MCP Agent** — Reference agent using `@phantom/mcp-server` as signing layer. Agent decides → Safe Executor quotes + simulates → Phantom MCP signs → tx submitted. Removes key management from the SDK; delegates to Phantom embedded wallet via OAuth (Google/Apple). Tools: `get_wallet_addresses`, `sign_transaction`, `transfer_tokens`, `buy_token`, `sign_message`. Multi-chain: Solana, ETH, BTC, Sui. Prerequisites: App ID from Phantom Portal + localhost:8080/callback redirect URL. Note: currently preview — use a dedicated test wallet, never mainnet assets.

### Dashboard Enhancements
- [ ] 🟡 Performance chart (P&L over time, decision accuracy)
- [ ] 🟡 Alert management (configure, mute, track)
- [ ] 🟡 Settings UI (thresholds, confirmation preferences)
- [ ] 🟡 Agent comparison (Portfolio vs. Yield Scout vs. Risk Monitor)

### Infrastructure
- [ ] 🟡 Supabase integration (persistent transaction history)
- [ ] 🟡 Monitoring crons (GitHub Actions, continuous monitoring)
- [ ] 🟡 Webhook support (send alerts to Discord, email, etc.)

### NPM Package
- [ ] 🟡 Publish to npm (@fffwaves/solana-agent-sdk)
- [ ] 🟡 TypeScript types (full type coverage)
- [ ] 🟡 Example projects (starter templates)

---

## Tier 3: Polish + Scale (Future) — OUT OF SCOPE FOR MVP

### Advanced Features (Post-MVP)
- [ ] 🔴 On-chain aggregation program (Rust smart contract)
- [ ] 🔴 Multi-wallet support (manage multiple accounts)
- [ ] 🔴 AI agent fine-tuning (train custom decision models)
- [ ] 🔴 Voice interface (agents respond to voice commands)
- [ ] 🔴 Browser extension (easy wallet integration)

### Scale + Performance
- [ ] 🔴 Optimize RPC calls (batch requests, caching)
- [ ] 🔴 Reduce latency (sub-second decision making)
- [ ] 🔴 Support 10k+ concurrent agents
- [ ] 🔴 High-availability deployment (multi-region)

### Community + Governance
- [ ] 🔴 Community analyzer contributions (plugin system)
- [ ] 🔴 Governance tokens (DAO for feature voting)
- [ ] 🔴 Bug bounty program
- [ ] 🔴 Solana Foundation grant

---

## Known Risks + Decisions

### Risk: 18-day timeline is tight
**Mitigation:** Focus on Tier 1 only, leave Tier 2+ for buffer/iteration

### Risk: Transaction parsing complexity (many protocol variations)
**Mitigation:** Start with 3 major protocols (Jupiter, Marinade, Orca), add others if time permits

### Risk: Smart contract security (agent executing real txns)
**Mitigation:** Confirmation flow + guardrails default to safe (testnet-first, amount limits, simulation before execution)

### Risk: Live agent monitoring infra (costs, uptime)
**Mitigation:** GitHub Actions + Vercel (both free tier compatible)

### Decision: On-chain program or pure off-chain?
**Choice:** Start with off-chain indexing, add Rust program (Tier 3) if time permits

### Decision: Testnet or mainnet?
**Choice:** Reference agents run on mainnet (small amounts), testnet for testing, user can configure

### Decision: Confirmation flow in fully autonomous mode?
**Choice:** Configurable (default: ask user, override available with `requireConfirmation: false`)

---

## Metrics (For Evaluation)

### Agent Autonomy
- [ ] Agent independently designed architecture (not handed down)
- [ ] Agent made protocol selection decisions (why these 5?)
- [ ] Agent iterated on risk detection (improved accuracy over time)
- [ ] Agent handled edge cases (bugs found + fixed autonomously)
- [ ] Build-log documents all major decisions

### Quality
- [ ] Transaction parser accuracy >95% (tested on 100+ txns)
- [ ] Risk detector accuracy >90% (tested on known rug pulls + safe tokens)
- [ ] Zero failed executions (simulation catches all failures)
- [ ] 3 reference agents live + working on Vercel
- [ ] Full test coverage (TDD approach)

### Solana Integration
- [ ] Parser supports 5+ protocols (Jupiter, Marinade, Orca, Raydium, Magic Eden)
- [ ] Executes real swaps/stakes (not fake)
- [ ] Uses Solana program introspection (not just surface-level)
- [ ] Meaningful data flow (agent learns + improves decisions)

### Reproducibility
- [ ] Full source code on GitHub (public)
- [ ] Clear instructions (local + live deployment)
- [ ] Example agents + tutorials
- [ ] API docs (all functions documented)

---

## Timeline Summary

| Phase | Days | Tasks | Status |
|-------|------|-------|--------|
| 1. Research + Design | 2 | 3 | Starting |
| 2. Core SDK | 4 | 8 | Pending |
| 3. Reference Agents | 3 | 11 | Pending |
| 4. Dashboard | 3 | 14 | Pending |
| 5. Polish + Deploy | 6 | 19 | Pending |
| **Total** | **18** | **19** | |

---

## How to Use This Document

1. **Active Work:** Check TASKS.md (current work items, marked with [ ])
2. **Planning:** Check BACKLOG.md (this file) for all features + tiers
3. **Progress:** Mark items complete in TASKS.md as you ship
4. **Tier Review:** Review tier labels to understand priority + autonomy rules
5. **Iteration:** Log learnings in build-log.md as you ship

Last updated: 2026-02-11 (starting Phase 1)
