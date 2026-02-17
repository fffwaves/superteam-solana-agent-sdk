import { Analyzer, AnalysisResult } from './types';
import { RugPullRisk } from '../risk/rug-detector';
export declare class RiskAnalyzer implements Analyzer<RugPullRisk> {
    name: string;
    analyze(risk: RugPullRisk): Promise<AnalysisResult>;
}
