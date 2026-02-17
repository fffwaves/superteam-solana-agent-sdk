import { PublicKey } from '@solana/web3.js';
import { SolanaInstruction } from './types/index';

export class InstructionParser {
  parse(instruction: any): string {
    // Handle parsed instructions from getParsedTransaction
    if (instruction.parsed) {
      const { type, info } = instruction.parsed;
      switch (type) {
        case 'transfer':
          return `Transfer ${info.amount || info.lamports} from ${info.source} to ${info.destination}`;
        case 'transferChecked':
          return `TransferChecked ${info.tokenAmount.uiAmount} from ${info.source} to ${info.destination}`;
        default:
          return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${JSON.stringify(info).slice(0, 50)}...`;
      }
    }

    const programId = instruction.programId.toString();
    return `Unknown instruction from program ${programId}`;
  }
}
