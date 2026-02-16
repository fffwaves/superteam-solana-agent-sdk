# @solana-agent-sdk/core

Core SDK module for AI agents to interact with Solana blockchain.

## Features

- **Transaction Parser**: Parse and analyze Solana transactions
- **Risk Detection**: Identify rug pulls, suspicious patterns, MEV exposure
- **Safe Executor**: Execute transactions with built-in safety guardrails
- **Decision Framework**: Structured decision logging and reasoning capture

## Installation

```bash
npm install @solana-agent-sdk/core
```

## Usage

```typescript
import { TransactionParser } from "@solana-agent-sdk/core";

const parser = new TransactionParser({
  rpcUrl: "https://api.mainnet-beta.solana.com",
});

const result = await parser.parseTransaction("transaction_signature");
console.log(result.summary);
```

## Module Structure

- `src/parser/` - Transaction parsing logic
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Test
npm test
```

## License

MIT
