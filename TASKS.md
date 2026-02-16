# TASKS - superteam

## In Progress
- [ ] 5.4 Assess MEV exposure (check for Jito bundles, frontrunning signs)
- [ ] 5.5 Assess portfolio risk (concentration analysis, token stability scoring)
- [ ] 5.6 Confidence scoring (how sure are we this is a rug?)
- [ ] 6.1 Build Jupiter swap executor (quote → simulate → execute)
- [ ] 6.2 Build Marinade stake executor (quote → simulate → execute)
- [ ] 6.3 Build SPL transfer executor (validation → simulate → execute)
- [ ] 6.4 Implement confirmation flow (ask agent/user for approval)
- [ ] 6.5 Implement safety guardrails (slippage limits, amount caps)
- [ ] 6.6 Implement transaction simulation (check if it will fail before submitting)
- [ ] 6.7 Implement error handling + logging (all failures tracked)
- [ ] 7.1 Build structured decision tree (analyze → evaluate → decide → execute)
- [ ] 7.2 Implement reasoning logger (capture why agent made each decision)
- [ ] 7.3 Implement outcome tracking (success/failure, learnings)
- [ ] 7.4 Build confidence scoring for decisions
- [ ] 7.5 Implement extensible analyzer pattern (easy to add custom analyzers)
- [ ] 8.1 Export unified SDK interface (single import, all modules available)

## Completed
- [x] 1.x-3.x Phase 1 (Research + Design)
- [x] 4.1 Setup TypeScript project structure + Anchor.js dependencies
- [x] 4.2 Build transaction fetcher (query Solana RPC, cache transactions)
- [x] 4.3 Build instruction parser (decode Anchor IDLs, parse custom programs)
- [x] 4.4 Parse SPL token transfers
- [x] 4.5 Parse Jupiter swaps
- [x] 4.6 Parse Marinade stakes
- [x] 4.7 Parse Orca liquidity operations
- [x] 4.8 Generate human-readable summaries
- [x] 4.9 Test parser against 100+ real transactions
- [x] 5.1 Build token metadata fetcher
- [x] 5.2 Detect rug pulls
- [x] 5.3 Detect suspicious patterns
