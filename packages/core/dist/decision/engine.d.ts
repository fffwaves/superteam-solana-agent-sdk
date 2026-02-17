import { DecisionRequest, DecisionResult, Analyzer } from './types';
export declare class DecisionEngine {
    private analyzers;
    private reasoningLog;
    private history;
    constructor();
    registerAnalyzer(analyzer: Analyzer, weight?: number): void;
    private logReasoning;
    decide(request: DecisionRequest): Promise<DecisionResult>;
    private createResult;
}
