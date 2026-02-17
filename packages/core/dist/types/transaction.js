"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionType = void 0;
/**
 * Types of instructions we can parse
 */
var InstructionType;
(function (InstructionType) {
    InstructionType["UNKNOWN"] = "unknown";
    InstructionType["SPL_TRANSFER"] = "spl_transfer";
    InstructionType["JUPITER_SWAP"] = "jupiter_swap";
    InstructionType["MARINADE_STAKE"] = "marinade_stake";
    InstructionType["ORCA_SWAP"] = "orca_swap";
    InstructionType["RAYDIUM_SWAP"] = "raydium_swap";
    InstructionType["MAGIC_EDEN_TRADE"] = "magic_eden_trade";
    InstructionType["SYSTEM_TRANSFER"] = "system_transfer";
})(InstructionType || (exports.InstructionType = InstructionType = {}));
