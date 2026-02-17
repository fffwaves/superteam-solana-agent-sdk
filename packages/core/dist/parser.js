"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionParser = void 0;
class InstructionParser {
    parse(instruction) {
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
        const programId = instruction.programId.toBase58();
        return `Unknown instruction from program ${programId}`;
    }
}
exports.InstructionParser = InstructionParser;
