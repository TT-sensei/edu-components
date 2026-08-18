import { EDU_EVENTS, emit } from './core/events.js';

export class CountdownTimer {
  constructor(seconds = 60, options = {}) {
    this.duration = Math.max(0, Number(seconds) || 0);
    this.warningAt = [...(options.warningAt || [10])].map(Number).filter(Number.isFinite);
    this.eventTarget = options.eventTarget;
    this.onTick = options.onTick;
    this.reset();
  }

  get remaining() { return this._remaining; }
  get isRunning() { return this._running; }

  start() {
    if (this._running) return this;
    if (this._remaining <= 0) {
      if (this._timeupEmitted) return this;
      emit(this.eventTarget, EDU_EVENTS.TIMER_START, { mode: 'countdown', value: 0, remaining: 0, duration: this.duration });
      if (!this._timeupEmitted) {
        this._timeupEmitted = true;
        emit(this.eventTarget, EDU_EVENTS.TIMEUP, { mode: 'countdown', value: 0, remaining: 0, duration: this.duration });
      }
      return this;
    }
    this._running = true;
    this._endAt = Date.now() + this._remaining * 1000;
    emit(this.eventTarget, EDU_EVENTS.TIMER_START, { mode: 'countdown', value: this._remaining, remaining: this._remaining, duration: this.duration });
    this._interval = setInterval(() => this._tick(), 100);
    this._tick();
    return this;
  }

  pause() { if (this._running) { this._tick(); this._running = false; clearInterval(this._interval); this._interval = null; } return this; }
  resume() { return this.start(); }

  reset(seconds = this.duration) {
    clearInterval(this._interval);
    this._interval = null;
    this.duration = Math.max(0, Number(seconds) || 0);
    this._remaining = this.duration;
    this._running = false;
    this._endAt = null;
    this._warned = new Set();
    this._timeupEmitted = false;
    this._notifyTick();
    return this;
  }

  _tick() {
    if (!this._running) return;
    const next = Math.max(0, Math.ceil((this._endAt - Date.now()) / 1000));
    if (next !== this._remaining) this._remaining = next;
    this._notifyTick();
    this.warningAt.forEach((mark) => { if (this._remaining === mark && !this._warned.has(mark)) { this._warned.add(mark); emit(this.eventTarget, EDU_EVENTS.TIMER_WARNING, { mode: 'countdown', value: mark, remaining: mark, threshold: mark }); } });
    if (this._remaining <= 0) { this._running = false; clearInterval(this._interval); this._interval = null; if (!this._timeupEmitted) { this._timeupEmitted = true; emit(this.eventTarget, EDU_EVENTS.TIMEUP, { mode: 'countdown', value: 0, remaining: 0, duration: this.duration }); } }
  }

  _notifyTick() { if (typeof this.onTick === 'function') this.onTick(this._remaining); }
}
