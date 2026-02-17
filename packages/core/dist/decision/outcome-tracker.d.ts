import { Outcome } from './types';
export declare class OutcomeTracker {
    private outcomes;
    recordOutcome(outcome: Outcome): void;
    getOutcomes(): Outcome[];
    getStats(): {
        total: number;
        successRate: number;
        successful?: undefined;
        failed?: undefined;
    } | {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
    };
    calculateAccuracy(): {
        total: number;
        successRate: number;
        successful?: undefined;
        failed?: undefined;
    } | {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
    };
}
