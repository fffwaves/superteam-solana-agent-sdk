export interface DecisionRequest {
    type: 'trade' | 'risk_check' | 'rebalance';
    data: any;
    context: Record<string, any>;
}
export interface DecisionResult {
    decision: 'execute' | 'reject' | 'wait' | 'escalate';
    action?: string;
    reasoning: string[];
    confidence: number;
    metadata: Record<string, any>;
}
export interface Outcome {
    requestId: string;
    success: boolean;
    actualResult: any;
    predictedResult: any;
    error?: string;
    timestamp: number;
}
export interface Analyzer<T = any> {
    name: string;
    analyze(data: T, context: any): Promise<AnalysisResult>;
}
export interface AnalysisResult {
    score: number;
    findings: string[];
    confidence: number;
    metadata?: any;
}
