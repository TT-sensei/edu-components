import { EDU_EVENTS, emit } from './core/events.js';

export class AnswerChecker {
  constructor(options = {}) {
    this.ignoreCase = options.ignoreCase ?? true;
    this.trim = options.trim ?? true;
    this.eventTarget = options.eventTarget;
  }

  normalize(value) {
    let result = String(value ?? '');
    if (this.trim) result = result.trim();
    if (this.ignoreCase) result = result.toLocaleLowerCase();
    return result;
  }

  check(answer, correct, options = {}) {
    const candidates = Array.isArray(correct) ? correct : [correct];
    const numeric = options.numeric ?? false;
    const matches = candidates.some((candidate) => numeric
      ? Number(answer) === Number(candidate) && String(answer).trim() !== ''
      : this.normalize(answer) === this.normalize(candidate));
    const detail = { answer, correct, isCorrect: matches };
    emit(this.eventTarget, matches ? EDU_EVENTS.CORRECT : EDU_EVENTS.WRONG, detail);
    return matches;
  }
}

