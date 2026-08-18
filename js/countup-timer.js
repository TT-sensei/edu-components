import { EDU_EVENTS, emit } from './core/events.js';

export class CountUpTimer {
  constructor(options = {}) { this.eventTarget = options.eventTarget; this.onTick = options.onTick; this.reset(); }
  get elapsed() { return this._elapsed; }
  get isRunning() { return this._running; }
  start() { if (this._running) return this; this._running = true; this._startedAt = Date.now() - this._elapsed * 1000; emit(this.eventTarget, EDU_EVENTS.TIMER_START, { mode: 'countup', value: this._elapsed, elapsed: this._elapsed, duration: null }); this._interval = setInterval(() => this._tick(), 100); this._tick(); return this; }
  pause() { if (this._running) { this._tick(); this._running = false; clearInterval(this._interval); this._interval = null; } return this; }
  resume() { return this.start(); }
  reset() { clearInterval(this._interval); this._interval = null; this._running = false; this._startedAt = null; this._elapsed = 0; this._notifyTick(); return this; }
  _tick() { if (!this._running) return; const next = Math.max(0, Math.floor((Date.now() - this._startedAt) / 1000)); if (next !== this._elapsed) { this._elapsed = next; this._notifyTick(); } }
  _notifyTick() { if (typeof this.onTick === 'function') this.onTick(this._elapsed); }
}
