/**
 * PhantomMCPClient — stub/mock for @phantom/mcp-server (preview SDK)
 *
 * TODO: Replace this stub with the real @phantom/mcp-server client once it's stable.
 * See: https://phantom.app/mcp-server
 *
 * The real MCP server exposes these tools via the Model Context Protocol:
 *   - get_wallet_addresses
 *   - sign_transaction
 *   - transfer_tokens
 *   - buy_token
 *   - sign_message
 *
 * Prerequisites (real integration):
 *   1. App ID from https://phantom.app/developer
 *   2. Redirect URL registered: e.g. http://localhost:8080/callback
 *   3. npm install @phantom/mcp-server (when available as stable)
 */

import {
  PhantomMCPConfig,
  WalletInfo,
  SigningRequest,
  SigningResult,
  TransferRequest,
  BuyTokenRequest,
  SupportedChain,
} from './types';

export class PhantomMCPClient {
  private config: PhantomMCPConfig;
  private connected: boolean = false;

  constructor(config: PhantomMCPConfig) {
    this.config = config;
    console.log(`[PhantomMCPClient] Initialized (STUB) — appId: ${config.appId}`);
    console.log(`[PhantomMCPClient] Redirect URL: ${config.redirectUrl}`);
    console.warn(`[PhantomMCPClient] ⚠️  This is a stub. Replace with real @phantom/mcp-server client.`);
  }

  /**
   * Connect to Phantom MCP server via OAuth
   * TODO: Real implementation triggers OAuth flow, opens browser to Phantom
   */
  async connect(): Promise<void> {
    console.log(`[PhantomMCPClient] Would initiate OAuth flow → ${this.config.redirectUrl}`);
    console.log(`[PhantomMCPClient] User would authorize in Phantom wallet`);
    this.connected = true;
  }

  /**
   * get_wallet_addresses — returns connected wallet addresses per chain
   * TODO: Real implementation calls Phantom MCP tool: get_wallet_addresses
   */
  async getWalletAddresses(): Promise<WalletInfo[]> {
    this.assertConnected();
    console.log(`[PhantomMCPClient] STUB: would call get_wallet_addresses`);
    // Stub returns a mock devnet address
    return [
      {
        address: 'STUB_DEVNET_ADDRESS_11111111111111111111111111',
        chain: 'solana',
        label: 'Phantom Wallet (stub)',
      },
      // TODO: ETH, BTC, Sui — stub
    ];
  }

  /**
   * sign_transaction — sends tx to Phantom for signing
   * TODO: Real implementation calls Phantom MCP tool: sign_transaction
   */
  async signTransaction(request: SigningRequest): Promise<SigningResult> {
    this.assertConnected();
    console.log(`[PhantomMCPClient] STUB: would call sign_transaction`);
    console.log(`[PhantomMCPClient] Description: ${request.description}`);
    console.log(`[PhantomMCPClient] Chain: ${request.chain}`);
    if (request.estimatedFeeSol !== undefined) {
      console.log(`[PhantomMCPClient] Estimated fee: ${request.estimatedFeeSol} SOL`);
    }
    if (request.chain !== 'solana') {
      // TODO: implement ETH, BTC, Sui signing
      return { success: false, error: `Chain ${request.chain} not yet implemented`, simulated: true };
    }
    // Stub — pretend Phantom signed it
    return {
      success: true,
      signature: 'STUB_SIGNATURE_' + Date.now(),
      simulated: true,
    };
  }

  /**
   * transfer_tokens — transfer SOL or SPL tokens
   * TODO: Real implementation calls Phantom MCP tool: transfer_tokens
   */
  async transferTokens(request: TransferRequest): Promise<SigningResult> {
    this.assertConnected();
    console.log(`[PhantomMCPClient] STUB: would call transfer_tokens`);
    console.log(`[PhantomMCPClient] ${request.amount} ${request.mint ?? 'SOL'} → ${request.toAddress}`);
    if (request.chain !== 'solana') {
      return { success: false, error: `Chain ${request.chain} not yet implemented`, simulated: true };
    }
    return {
      success: true,
      signature: 'STUB_TRANSFER_SIG_' + Date.now(),
      simulated: true,
    };
  }

  /**
   * buy_token — buy a token via Jupiter (Phantom handles routing)
   * TODO: Real implementation calls Phantom MCP tool: buy_token
   */
  async buyToken(request: BuyTokenRequest): Promise<SigningResult> {
    this.assertConnected();
    console.log(`[PhantomMCPClient] STUB: would call buy_token`);
    console.log(`[PhantomMCPClient] Buy ${request.outputMint} with ${request.amount} ${request.inputMint ?? 'SOL'}`);
    if (request.chain !== 'solana') {
      return { success: false, error: `Chain ${request.chain} not yet implemented`, simulated: true };
    }
    return {
      success: true,
      signature: 'STUB_BUY_SIG_' + Date.now(),
      simulated: true,
    };
  }

  /**
   * sign_message — sign an arbitrary message (for auth, proofs, etc.)
   * TODO: Real implementation calls Phantom MCP tool: sign_message
   */
  async signMessage(message: string, chain: SupportedChain = 'solana'): Promise<{ signature: string }> {
    this.assertConnected();
    console.log(`[PhantomMCPClient] STUB: would call sign_message — chain: ${chain}`);
    return { signature: 'STUB_MESSAGE_SIG_' + Buffer.from(message).toString('hex').slice(0, 16) };
  }

  isConnected(): boolean {
    return this.connected;
  }

  private assertConnected(): void {
    if (!this.connected) {
      throw new Error('PhantomMCPClient not connected. Call connect() first.');
    }
  }
}
