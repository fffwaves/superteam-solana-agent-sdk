# Feature: Risk Detector Polish

- [ ] 5.3 Implement pattern detection for rapid token transfers
  **Effort:** M
  **Tier:** 1
  **Acceptance Criteria:**
  - [ ] Logic to detect high-frequency transfers for a single token within short time windows
  - [ ] Integration with existing risk detector module
  - [ ] Return suspicion score based on frequency/volume

- [ ] 5.4 Assessing MEV exposure signs
  **Effort:** M
  **Tier:** 1
  **Dependencies:** 5.3
  **Acceptance Criteria:**
  - [ ] Detect presence of Jito bundles in transaction history
  - [ ] Identify sandwich attack patterns for token pairs
  - [ ] Output MEV risk level (Low/Medium/High)

- [ ] 5.5 Portfolio concentration analysis
  **Effort:** S
  **Tier:** 1
  **Acceptance Criteria:**
  - [ ] Calculate percentage of wallet value in single tokens
  - [ ] Flag tokens with >20% concentration as "High Risk"
  - [ ] Integration with portfolio tracker data structures
