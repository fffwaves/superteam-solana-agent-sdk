# TASKS.md - Active Work Items

**Project:** Solana Agent SDK (Superteam Open Innovation Track)
**Deadline:** March 1, 2026 (18 days)
**Status:** Phase 1 (Research + Design) Complete. Starting Phase 2 (Core SDK Implementation)

---

## Phase 1: Research + Design (Days 1-2) - COMPLETE

### 1. Research Agent Needs on Solana
- [x] 1.1 Analyze what AI agents need to do safely on Solana (transactions, risks, execution)
- [x] 1.2 Document common use cases (portfolio tracking, yield farming, trading, risk monitoring)
- [x] 1.3 Identify gaps in existing tools (why no agent-first SDK exists)
- [x] 1.4 Decision: What protocols to support first? (Jupiter, Marinade, Orca, Magic Eden, Raydium)
- [x] 1.5 Log research findings + decisions in build-log.md

### 2. Design Modular Architecture
- [x] 2.1 Design SDK module structure (core, agents, dashboard)
- [x] 2.2 Design transaction parser module (what data structures, what outputs)
- [x] 2.3 Design risk detector module (what patterns to detect, confidence scoring)
- [x] 2.4 Design safe executor module (confirmation flow, guardrails, simulation)
- [x] 2.5 Design decision framework (structured logging, reasoning capture)
- [x] 2.6 Create architecture diagram + module contracts

### 3. Select Initial Protocols + Create Breakdown
- [x] 3.1 Choose 5 protocols to support (Jupiter swaps, Marinade staking, Orca liquidity, Magic Eden NFTs, Raydium pools)
- [x] 3.2 Map instruction patterns for each protocol
- [x] 3.3 Document protocol-specific risks + detection rules
- [x] 3.4 Create task breakdown + estimate effort per module

---

## Phase 2: Core SDK (Days 3-6)

### 4. Transaction Parser Module
- [ ] 4.1 Setup TypeScript project structure + Anchor.js dependencies
- [ ] 4.2 Build transaction fetcher (query Solana RPC, cache transactions)
- [ ] 4.3 Build instruction parser (decode Anchor IDLs, parse custom programs)
- [ ] 4.4 Parse SPL token transfers (source, dest, amount, decimals)
- [ ] 4.5 Parse Jupiter swaps (input token, output token, price, slippage)
- [ ] 4.6 Parse Marinade stakes (SOL → mSOL, APY)
- [ ] 4.7 Parse Orca liquidity operations (add/remove liquidity, LP tokens)
- [ ] 4.8 Generate human-readable summaries (natural language output)
- [ ] 4.9 Test parser against 100+ real transactions

### 5. Risk Detector Module
- [ ] 5.1 Build token metadata fetcher (supply, holder distribution, mint authority)
- [ ] 5.2 Detect rug pulls (concentrated holders, disabled mint authority, zero liquidity)
- [ ] 5.3 Detect suspicious patterns (rapid token transfers, unusual account behavior)
- [ ] 5.4 Assess MEV exposure (check for Jito bundles, frontrunning signs)
- [ ] 5.5 Assess portfolio risk (concentration analysis, token stability scoring)
- [ ] 5.6 Confidence scoring (how sure are we this is a rug?)
- [ ] 5.7 Test against known rug pulls + safe tokens

### 6. Safe Executor Module
- [ ] 6.1 Build Jupiter swap executor (quote → simulate → execute)
- [ ] 6.2 Build Marinade stake executor (quote → simulate → execute)
- [ ] 6.3 Build SPL transfer executor (validation → simulate → execute)
- [ ] 6.4 Implement confirmation flow (ask agent/user for approval)
- [ ] 6.5 Implement safety guardrails (slippage limits, amount caps)
- [ ] 6.6 Implement transaction simulation (check if it will fail before submitting)
- [ ] 6.7 Implement error handling + logging (all failures tracked)
- [ ] 6.8 Test executor with testnet transactions

### 7. Decision Framework Module
- [ ] 7.1 Build structured decision tree (analyze → evaluate → decide → execute)
- [ ] 7.2 Implement reasoning logger (capture why agent made each decision)
- [ ] 7.3 Implement outcome tracking (success/failure, learnings)
- [ ] 7.4 Build confidence scoring for decisions
- [ ] 7.5 Implement extensible analyzer pattern (easy to add custom analyzers)
- [ ] 7.6 Test decision logic with simulated scenarios

### 8. Core SDK Integration
- [ ] 8.1 Export unified SDK interface (single import, all modules available)
- [ ] 8.2 Write SDK examples + quick-start guide
- [ ] 8.3 Test full SDK flow (parse → analyze → decide → execute)
- [ ] 8.4 Document API contracts + expected inputs/outputs

---

## Phase 3: Reference Agents (Days 7-9)

### 9. Portfolio Tracker Agent
- [ ] 9.1 Design portfolio tracker logic (track holdings, calculate P&L)
- [ ] 9.2 Build wallet monitor (poll every 5 min, detect changes)
- [ ] 9.3 Build P&L calculator (purchase price → current price → gain/loss)
- [ ] 9.4 Build risk assessment (flag holdings, rug pull detection)
- [ ] 9.5 Build alert system (notify user of changes, risks)
- [ ] 9.6 Test with sample portfolios (verify accuracy)

### 10. Yield Scout Agent
- [ ] 10.1 Design yield tracking logic (monitor APY changes)
- [ ] 10.2 Build protocol monitor (Marinade, Lido, Orca, Raydium, Anchor)
- [ ] 10.3 Build APY calculator (current yield, 7-day trend, projected returns)
- [ ] 10.4 Build recommendation engine (when to shift yield strategies)
- [ ] 10.5 Build execution layer (recommend swaps via Jupiter)
- [ ] 10.6 Test with live yield data

### 11. Risk Monitor Agent
- [ ] 11.1 Design risk monitoring logic (watch for exploits, rugs, MEV)
- [ ] 11.2 Build exploit detector (monitor Solana ecosystem for known exploits)
- [ ] 11.3 Build rug pull alert (flag tokens matching rug patterns)
- [ ] 11.4 Build MEV monitor (detect sandwich attacks, unusual patterns)
- [ ] 11.5 Build alert system (real-time notifications)
- [ ] 11.6 Test with known exploit scenarios

---

## Phase 4: Dashboard (Days 10-12)

### 12. Vercel Dashboard Setup
- [ ] 12.1 Create Next.js 15 project (shadcn/ui, TailwindCSS)
- [ ] 12.2 Setup Vercel deployment pipeline
- [ ] 12.3 Create database schema (Supabase for transaction history)
- [ ] 12.4 Setup API routes (expose SDK functionality)

### 13. Dashboard UI Components
- [ ] 13.1 Build agent status display (showing which agents are running)
- [ ] 13.2 Build transaction history table (with reasoning)
- [ ] 13.3 Build risk assessment dashboard (portfolio risks, alerts)
- [ ] 13.4 Build performance chart (P&L over time, decision accuracy)
- [ ] 13.5 Build settings UI (configure alerts, confirmation thresholds)

### 14. Live Agent Integration
- [ ] 14.1 Connect Portfolio Tracker to dashboard (live updates)
- [ ] 14.2 Connect Yield Scout to dashboard (live opportunities)
- [ ] 14.3 Connect Risk Monitor to dashboard (live alerts)
- [ ] 14.4 Test end-to-end flows (agent action → dashboard update)

---

## Phase 5: Polish + Deployment (Days 13-18)

### 15. Testing + Edge Cases
- [ ] 15.1 Test transaction parser against edge cases (failed txns, unusual instructions)
- [ ] 15.2 Test risk detector against false positives (improve accuracy)
- [ ] 15.3 Test executor against network issues (retry logic, timeouts)
- [ ] 15.4 Test decision framework with real market data
- [ ] 15.5 Stress test agents (rapid market changes, high volume)

### 16. Iteration Based on Learnings
- [ ] 16.1 Analyze agent decisions (what worked, what didn't)
- [ ] 16.2 Improve risk detection accuracy (reduce false positives)
- [ ] 16.3 Improve recommendation quality (better yield calculations)
- [ ] 16.4 Optimize performance (reduce API calls, cache aggressively)
- [ ] 16.5 Log all iterations in build-log.md

### 17. Documentation
- [ ] 17.1 Write API documentation (all SDK functions with examples)
- [ ] 17.2 Write agent development guide (how to build custom agents)
- [ ] 17.3 Write deployment guide (local + live)
- [ ] 17.4 Write architecture docs (module contracts, data flows)
- [ ] 17.5 Create example agents + tutorials

### 18. Final Deployment
- [ ] 18.1 Deploy SDK to npm (public package)
- [ ] 18.2 Deploy dashboard to Vercel (live link)
- [ ] 18.3 Deploy monitoring crons (GitHub Actions)
- [ ] 18.4 Setup GitHub repository (public, MIT license)
- [ ] 18.5 Verify all 3 reference agents are running live

### 19. Submission Preparation
- [ ] 19.1 Write build-log.md narrative (agent decisions + learnings)
- [ ] 19.2 Write README (product overview, why it's novel, how agent built it)
- [ ] 19.3 Create demo (screenshots, video, or live dashboard link)
- [ ] 19.4 Prepare submission package (repo URL, README, demo)
- [ ] 19.5 Final review + quality check

---

## Current Status

**Active Phase:** 1 (Research + Design)
**Days Remaining:** 18
**Confidence:** 92%

Next: Start with task 1 (Research Agent Needs)

