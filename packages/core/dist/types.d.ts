import { PublicKey } from '@solana/web3.js';
export interface ActivityEntry {
    timestamp: string;
    type: 'task_completed' | 'deployment' | 'file_created' | 'build' | 'research' | 'memory_update' | 'prd' | 'commit';
    title: string;
    details?: string;
    project: string;
}
export interface SolanaTransaction {
    signature: string;
    slot: number;
    blockTime: number;
    instructions: SolanaInstruction[];
    raw: any;
}
export interface SolanaInstruction {
    programId: PublicKey;
    data: string;
    accounts: PublicKey[];
    summary?: string;
}
export interface RiskProfile {
    score: number;
    factors: string[];
    level: 'low' | 'medium' | 'high' | 'critical';
}
