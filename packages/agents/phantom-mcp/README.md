# @solana-agent-sdk/phantom-mcp

> ⚠️ **Preview Notice:** This agent uses `@phantom/mcp-server` which is currently in preview. Use a **dedicated test wallet** with devnet funds only. **Never use mainnet assets.**

A reference agent for the [Solana Agent SDK](../../) that delegates transaction signing to Phantom wallet via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). No private key management required — the agent decides and simulates; Phantom handles signing.

## Architecture

```
PhantomMCPAgent
       │
       ▼
 Decision Engine          (evaluateOpportunity → action + confidence)
       │
       ▼
 Safe Executor            (simulate transaction against RPC)
       │
       ▼
 Phantom MCP Client       (sign_transaction / transfer_tokens / buy_token)
       │
       ▼
 Phantom Wallet           (user approves in Phantom app via OAuth)
       │
       ▼
 Solana RPC               (broadcast signed transaction)
```

## Prerequisites

1. **App ID** — Register your app at [Phantom Developer Portal](https://phantom.app/developer)
2. **Redirect URL** — Add `http://localhost:8080/callback` (or your URL) in the portal
3. **Test wallet** — Create a fresh Phantom wallet on devnet. Never use mainnet assets.

## Installation

```bash
npm install @solana-agent-sdk/phantom-mcp
```

## Quick Start

```typescript
import { PhantomMCPAgent, PhantomMCPConfig } from '@solana-agent-sdk/phantom-mcp';

const config: PhantomMCPConfig = {
  appId: 'YOUR_PHANTOM_APP_ID',
  redirectUrl: 'http://localhost:8080/callback',
  chain: 'solana',
  rpcUrl: 'https://api.devnet.solana.com',
  maxTransactionValueSol: 0.1, // safety cap
};

const agent = new PhantomMCPAgent(config);
await agent.initialize(); // triggers OAuth → Phantom wallet connect

const outcome = await agent.run({ /* your market context */ });
console.log(outcome);
```

## Custom Strategy

Subclass `PhantomMCPAgent` and override `evaluateOpportunity()`:

```typescript
class MyAgent extends PhantomMCPAgent {
  async evaluateOpportunity(context) {
    // your logic here
    return {
      action: 'swap',
      confidence: 0.85,
      reasoning: 'SOL/USDC ratio looks good',
      request: {
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        amount: 0.5,
        chain: 'solana',
      },
    };
  }
}
```

See [`src/examples/basic-swap.ts`](./src/examples/basic-swap.ts) for a full example.

## Supported MCP Tools

| Tool | Description | Implemented |
|------|-------------|-------------|
| `get_wallet_addresses` | Get connected wallet addresses | ✅ (stub) |
| `sign_transaction` | Sign a raw transaction | ✅ (stub) |
| `transfer_tokens` | Transfer SOL or SPL tokens | ✅ (stub) |
| `buy_token` | Buy a token via Jupiter routing | ✅ (stub) |
| `sign_message` | Sign an arbitrary message | ✅ (stub) |

## Multi-Chain Support

| Chain | Status |
|-------|--------|
| Solana | ✅ Implemented |
| Ethereum | 🚧 Stubbed (TODO) |
| Bitcoin | 🚧 Stubbed (TODO) |
| Sui | 🚧 Stubbed (TODO) |

## Safety Features

- **Always simulates** before sending to Phantom (override with `skipSimulation: true` — not recommended)
- **Value cap** via `maxTransactionValueSol` — blocks transactions above threshold
- **Chain guard** — non-Solana chains return error until implemented
- **Connection check** — throws if `connect()` not called before signing

## Development

```bash
npm install
npm run typecheck   # check types without building
npm run build       # compile TypeScript
npm run example     # run basic-swap example
```

## Related

- [Core SDK](../../core/) — Transaction fetcher, parser, decision engine, safe executor
- [Yield Scout Agent](../yield-scout/) — APY monitoring reference agent
- [Risk Monitor Agent](../risk-monitor/) — Exploit detection reference agent
- [Phantom MCP Server](https://phantom.app/mcp-server) — Official Phantom MCP docs
