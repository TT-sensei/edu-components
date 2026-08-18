import { EDU_EVENTS, emit } from './core/events.js';

const SAVE_VERSION = 1;

function finiteInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.floor(number) : fallback;
}

export class LevelManager {
  constructor(options = {}) {
    this.storage = options.storage || null;
    this.storageKey = options.storageKey || 'level';
    this.eventTarget = options.eventTarget;
    this.min = finiteInteger(options.min, 1);
    this.max = Math.max(this.min, finiteInteger(options.max, 10));
    this.initial = this._clamp(finiteInteger(options.level ?? options.initial, this.min));
    this.level = this.initial;
    this._restore();
  }

  _clamp(value) {
    return Math.min(this.max, Math.max(this.min, value));
  }

  _restore() {
    if (!this.storage || typeof this.storage.load !== 'function') return;
    const saved = this.storage.load(this.storageKey, null);
    const value = saved && typeof saved === 'object' ? saved.level : saved;
    if (value !== null && value !== undefined) this.level = this._clamp(finiteInteger(value, this.initial));
  }

  _save() {
    if (!this.storage || typeof this.storage.save !== 'function') return;
    this.storage.save(this.storageKey, { version: SAVE_VERSION, level: this.level });
  }

  _notify(previous) {
    emit(this.eventTarget, EDU_EVENTS.LEVEL_CHANGE, {
      previous,
      current: this.level,
      min: this.min,
      max: this.max
    });
    return this.level;
  }

  getLevel() { return this.level; }
  getMin() { return this.min; }
  getMax() { return this.max; }

  setLevel(value) {
    const next = this._clamp(finiteInteger(value, this.level));
    if (next === this.level) return this.level;
    const previous = this.level;
    this.level = next;
    this._save();
    return this._notify(previous);
  }

  up(amount = 1) {
    const step = Math.max(0, finiteInteger(amount, 1));
    return this.setLevel(this.level + step);
  }

  down(amount = 1) {
    const step = Math.max(0, finiteInteger(amount, 1));
    return this.setLevel(this.level - step);
  }

  reset() {
    return this.setLevel(this.initial);
  }
}
