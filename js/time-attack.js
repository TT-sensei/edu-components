import { EDU_EVENTS, emit } from './core/events.js';
import { CountdownTimer } from './countdown-timer.js';

export class TimeAttack {
  constructor(options = {}) {
    this.duration = Math.max(0, Number(options.duration ?? options.seconds ?? 60) || 0);
    this.eventTarget = options.eventTarget;
    this.questionPool = options.questionPool || null;
    this.scoreManager = options.scoreManager || null;
    this.comboManager = options.comboManager || null;
    this.points = Number(options.points ?? 1) || 0;
    this.timer = options.timer || new CountdownTimer(this.duration, { eventTarget: this.eventTarget, warningAt: options.warningAt || [10] });
    this._onCorrect = () => this._record(true);
    this._onWrong = () => this._record(false);
    this._onTimeup = () => this.finish();
    this.eventTarget?.addEventListener?.(EDU_EVENTS.CORRECT, this._onCorrect);
    this.eventTarget?.addEventListener?.(EDU_EVENTS.WRONG, this._onWrong);
    this.eventTarget?.addEventListener?.(EDU_EVENTS.TIMEUP, this._onTimeup);
    this.reset();
  }

  start() { this.reset(); this.active = true; this.nextQuestion(); this.timer.start(); return this; }
  pause() { if (this.active) { this.paused = true; this.timer.pause(); } return this; }
  resume() { if (this.active) { this.paused = false; this.timer.resume(); } return this; }
  reset() { this.active = false; this.paused = false; this.questionsAnswered = 0; this.correctCount = 0; this.currentQuestion = null; this.scoreManager?.reset?.(); this.comboManager?.reset?.(); this.timer.reset(this.duration); return this; }
  nextQuestion(criteria = {}) { this.currentQuestion = this.questionPool?.next(criteria) || null; return this.currentQuestion; }
  submit(result) { if (!this.active || this.paused || result?.ignored) return false; if (typeof result === 'boolean') emit(this.eventTarget, result ? EDU_EVENTS.CORRECT : EDU_EVENTS.WRONG, { answer: null, correct: null, isCorrect: result, source: 'TimeAttack', type: 'timeattack' }); return true; }

  _record(isCorrect) {
    if (!this.active || this.paused) return;
    this.questionsAnswered += 1;
    if (isCorrect) { this.correctCount += 1; this.scoreManager?.correct(this.points); this.comboManager?.correct(); }
    else { this.scoreManager?.wrong(); this.comboManager?.wrong(); }
  }

  finish() { if (!this.active) return this.getResult(); this.timer.pause(); this.active = false; this.paused = false; const result = this.getResult(); emit(this.eventTarget, EDU_EVENTS.COMPLETE, { type: 'timeattack', value: result, result }); return result; }
  getResult() { return { duration: this.duration, timeRemaining: this.timer.remaining, questionsAnswered: this.questionsAnswered, correct: this.correctCount, score: this.scoreManager?.getResult?.() || null, combo: this.comboManager ? { current: this.comboManager.getCurrent(), max: this.comboManager.getMax() } : null }; }
  destroy() { this.eventTarget?.removeEventListener?.(EDU_EVENTS.CORRECT, this._onCorrect); this.eventTarget?.removeEventListener?.(EDU_EVENTS.WRONG, this._onWrong); this.eventTarget?.removeEventListener?.(EDU_EVENTS.TIMEUP, this._onTimeup); this.timer.pause(); }
}
