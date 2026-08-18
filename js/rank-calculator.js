import { EDU_EVENTS, emit } from './core/events.js';

export class RankCalculator {
  constructor(options = {}) {
    this.eventTarget = options.eventTarget;
    this.rules = options.rules || [
      { rank: 'S', minAccuracy: 90 },
      { rank: 'A', minAccuracy: 75 },
      { rank: 'B', minAccuracy: 50 },
      { rank: 'C', minAccuracy: 0 }
    ];
  }
  calculate(result) {
    const accuracy = result.accuracy ?? (result.questionsAnswered ? (result.correct / result.questionsAnswered) * 100 : 0);
    const rank = this.rules.find((rule) => typeof rule.test === 'function' ? rule.test(result) : accuracy >= (rule.minAccuracy ?? 0))?.rank || this.rules.at(-1)?.rank || 'C';
    const detail = { rank, accuracy, result };
    emit(this.eventTarget, EDU_EVENTS.RANK, detail);
    return detail;
  }
}

