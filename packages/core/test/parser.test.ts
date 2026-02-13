import { Connection, PublicKey } from '@solana/web3.js';
import { SolanaAgentSDK } from '../src';

/**
 * Test transaction parser against real Solana transactions
 * 
 * Run with: npx tsx test/parser.test.ts
 */

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Known transaction signatures to test against
const TEST_SIGNATURES = [
  // Add known Jupiter swap signatures here
  '5KtPn...', // Jupiter swap example
  // Add Marinade stake signatures
  '3JhQx...', // Marinade stake example
  // Add Orca liquidity ops
  '2FgYz...', // Orca add liquidity example
];

async function testParser() {
  const sdk = new SolanaAgentSDK(RPC_URL);
  
  console.log('🧪 Testing transaction parser...\n');
  
  let passed = 0;
  let failed = 0;

  for (const signature of TEST_SIGNATURES) {
    try {
      console.log(`📝 Fetching ${signature.slice(0, 8)}...`);
      
      const tx = await sdk.fetcher.fetchTransaction(signature);
      
      if (!tx) {
        console.log(`  ❌ Transaction not found\n`);
        failed++;
        continue;
      }

      // Parse instructions
      const summaries = tx.instructions.map(ix => sdk.parser.parse(ix));
      
      console.log(`  ✅ Parsed ${summaries.length} instructions`);
      summaries.forEach((s, i) => {
        console.log(`     ${i + 1}. ${s}`);
      });
      console.log('');
      
      passed++;
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log('\n📊 Results:');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📈 Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

// Run if executed directly
if (require.main === module) {
  testParser().catch(console.error);
}

export { testParser };
