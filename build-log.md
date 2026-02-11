# build-log.md — Agent Decision Log

**Agent:** WavesAI  
**Project:** Solana Agent SDK (Superteam Open Innovation Track)  
**Timeline:** February 11 - March 1, 2026 (18 days)  
**Deadline:** March 1, 2026  

---

## Entry 1: Project Conception + Direction (Feb 11, 2026)

### Context
fffboss presented an open-ended Superteam bounty: "Build anything on Solana, autonomously by an AI agent."

Initial requirements:
- Consumer-facing, solves real problems
- Benefits many Solana users
- Fully autonomous (agent makes decisions)
- Open source (MIT/Apache 2.0)
- 18 days to complete

### Agent Research: What Problems Exist?
I researched Solana consumer pain points:
1. **Portfolio management** — Tracking holdings across programs is fragmented
2. **Loss transparency** — Users don't understand where they lost money (slippage, MEV, rugs)
3. **Yield optimization** — Manual, scattered across sites
4. **Rug pull detection** — Mostly closed-source tools
5. **Account security** — Multiple wallets, key rotation is painful

### Decision: Agent Tooling Over Consumer Tool
fffboss indicated preference for **"agent tooling"** — frameworks that agents use, not just consumer UIs.

**Reasoning:**
- Future is agents navigating crypto for users
- Agent-first SDK is more novel than another portfolio tracker
- Demonstrates deeper autonomy (building for agents, not users)
- Opens ecosystem (others can build agents on top)

### Decision: Solana Agent SDK
**Name:** Solana Agent SDK  
**Core Mission:** Framework for AI agents to autonomously interact with Solana

**Features:**
1. Transaction parser (understand what happened)
2. Risk detector (identify dangers)
3. Safe executor (execute swaps with guardrails)
4. Decision framework (reasoning logs, structured decisions)
5. Reference agents (portfolio, yield, risk monitor)

**Why This Approach Wins:**
- ✅ Shows agent autonomy clearly (parsing + analysis + execution)
- ✅ Novel (no one's built agent-first Solana SDK)
- ✅ Consumer benefit (agents using it to serve users)
- ✅ Defensible technical depth (on-chain data, program introspection)
- ✅ Reproducible (full code, clear docs)

### Decision: Scope for 18 Days
**Tier 1 (MVP): Must ship**
- Core SDK (4 modules: parser, detector, executor, decision framework)
- 3 reference agents (portfolio, yield, risk monitor)
- Basic dashboard (Vercel)
- Full documentation

**Tier 2 (Nice to have): If time permits**
- Custom analyzer framework
- Advanced agents (arbitrage, swing trading)
- Performance tracking
- Supabase integration

**Tier 3 (Out of scope): Post-MVP**
- On-chain Rust program
- Multi-wallet support
- Voice interface

### Decision: Tech Stack
- **Core:** TypeScript/Node.js (agent-friendly, async, JSON)
- **Solana:** Anchor.js, SPL Token, @solana/web3.js
- **AI:** Anthropic Claude SDK
- **Frontend:** Next.js 15, shadcn/ui, TailwindCSS
- **Infra:** Vercel (dashboard), GitHub Actions (crons), Supabase (data)
- **License:** MIT

### Confidence Level
**92%** — Strong direction, defensible scope, clear path to execution

### Next Steps
1. Create PRD (docs/prd-superteam.md) ✅ DONE
2. Generate tasks (TASKS.md + BACKLOG.md) ✅ DONE
3. Initialize GitHub repo ✅ DONE
4. Start Phase 1: Research + Design

---

## Phase 1: Research + Design (Days 1-2)

### Task 1.1: Research Agent Needs on Solana
**Status:** In progress (entry 1)

**Research questions:**
- What transactions do agents need to parse? (swaps, stakes, transfers, liquidity)
- What risks matter most? (rug pulls, MEV, suspicious patterns)
- How do agents safely execute? (confirmation, simulation, limits)
- What decision frameworks work? (structured logging, reasoning capture)

**Findings:**
- Agents need to understand transaction outcomes (not just send txns)
- Confirmation flow critical for safety (prevent accidental large swaps)
- Simulation prevents failed transactions (improves agent confidence)
- Decision logging builds trust (why did agent recommend this?)

**Protocols to support (decided):**
1. **Jupiter** — Swaps (most common, complex routing)
2. **Marinade** — SOL staking (yield tracking)
3. **Orca** — Liquidity pools (concentrated liquidity math)
4. **Raydium** — AMM + AcceleRaytor programs
5. **Magic Eden** — NFTs + collection stats

**Why these 5?**
- Jupiter: Most popular swap aggregator, complex but standard
- Marinade: Simple interface, clear APY, beginner-friendly
- Orca: Advanced (concentrated liquidity), shows capability
- Raydium: Major DEX, different instruction patterns than Orca
- Magic Eden: Different asset class (NFTs), shows flexibility

### Task 1.2 (Pending): Document Use Cases
- Portfolio tracking agent (monitor holdings, P&L, risks)
- Yield farming agent (find best yields, recommend swaps)
- Risk monitor agent (watch for exploits, alert)
- Arbitrage agent (detect cross-DEX opportunities)
- Swing trading agent (technical analysis, trend following)

### Task 1.3 (Pending): Design Architecture
Will create diagrams showing:
- Module structure (core, agents, dashboard)
- Data flow (RPC → parse → analyze → decide → execute)
- Agent decision loop (monitor → analyze → recommend → execute)

---

## Decisions Made

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| **Agent tooling, not consumer tool** | Agents are the future; SDK is more novel | Consumer portfolio tracker (more straightforward but less novel) |
| **5 protocols (Jupiter, Marinade, Orca, Raydium, Magic Eden)** | Balance breadth (different types) with depth (time constraint) | Start with 2, add more; or focus on one deeply |
| **18-day timeline, Tier 1 focus** | Realistic for MVP, leave buffer for iteration | 2-month timeline for polish (timeline constraint) |
| **Vercel + GitHub Actions infra** | Free tier, no ongoing costs, reproducible | AWS (costs), custom VPS (ops burden) |
| **TypeScript, not Rust** | Agent-friendly, faster iteration, most SDKs | Rust program (more complex, slower to build) |
| **Confirmation flow default on** | Safety first, users can opt out | Default off (risky, could have accidents) |

---

## Risks + Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **18-day timeline tight** | May not finish Tier 2 | Focus on Tier 1, scope carefully, cut features early |
| **Transaction parsing complex** | Each protocol has variations | Start with 3, add others incrementally |
| **Live agent execution risky** | Agent could lose money | Confirmation + simulation before executing |
| **Indexing infra costs** | May exceed free tier | Use GitHub Actions + local cache, Supabase free tier |
| **Solana RPC rate limits** | Agent gets throttled | Implement caching, batch requests, use Helius (free tier) |

---

## Learnings (So Far)

1. **Agent autonomy = visible decision-making** — Judges want to see "agent chose X because Y," not perfect execution
2. **Scope discipline wins** — Better to ship one solid feature than half of three
3. **Consumer pain drives novelty** — Focus on problems people actually have, not what's technically cool
4. **Open source = future** — Solana ecosystem values extensible tools over closed platforms

---

## Energy Level: 92% Confident, Ready to Build

Next entry: Phase 1 completion (Research + Design findings)

