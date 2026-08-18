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

  matches(answer, correct, options = {}) {
    if (typeof options.comparator === 'function') return Boolean(options.comparator(answer, correct, this));
    const candidates = Array.isArray(correct) ? correct : [correct];
    const numeric = options.numeric ?? false;
    return candidates.some((candidate) => numeric
      ? Number(answer) === Number(candidate) && String(answer).trim() !== ''
      : this.normalize(answer) === this.normalize(candidate));
  }

  check(answer, correct, options = {}) {
    const matches = this.matches(answer, correct, options);
    const detail = { answer, correct, isCorrect: matches, ...(options.detail || {}) };
    emit(this.eventTarget, matches ? EDU_EVENTS.CORRECT : EDU_EVENTS.WRONG, detail);
    return matches;
  }
}
