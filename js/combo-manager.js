import { EDU_EVENTS, emit } from './core/events.js';

export class ComboManager {
  constructor(options = {}) {
    this.eventTarget = options.eventTarget;
    this.milestones = [...(options.milestones || [])].map(Number).filter(Number.isFinite);
    this.reset();
  }
  correct() {
    this.current += 1;
    this.max = Math.max(this.max, this.current);
    emit(this.eventTarget, EDU_EVENTS.COMBO, { current: this.current, max: this.max });
    if (this.milestones.includes(this.current)) emit(this.eventTarget, EDU_EVENTS.COMPLETE, { type: 'combo', value: this.current, result: { current: this.current, max: this.max } });
    return this.current;
  }
  wrong() { this.current = 0; return this.current; }
  reset() { this.current = 0; this.max = 0; return this; }
  getCurrent() { return this.current; }
  getMax() { return this.max; }
}
