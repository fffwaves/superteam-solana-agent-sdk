import { Outcome } from './types';

export class OutcomeTracker {
  private outcomes: Outcome[] = [];

  recordOutcome(outcome: Outcome) {
    this.outcomes.push(outcome);
    console.log(`[OutcomeTracker] Recorded outcome for ${outcome.requestId}: ${outcome.success ? 'SUCCESS' : 'FAILURE'}`);
    if (outcome.error) {
      console.error(`[OutcomeTracker] Error details: ${outcome.error}`);
    }
  }

  getOutcomes() {
    return this.outcomes;
  }

  getStats() {
    const total = this.outcomes.length;
    if (total === 0) return { total: 0, successRate: 0 };

    const successful = this.outcomes.filter(o => o.success).length;
    return {
      total,
      successful,
      failed: total - successful,
      successRate: (successful / total) * 100
    };
  }

  calculateAccuracy() {
    // Compare predictedResult vs actualResult if possible
    // This is domain specific, so for now we just return basic stats
    return this.getStats();
  }
}
