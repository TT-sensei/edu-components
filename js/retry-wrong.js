import { QuestionPool } from './question-pool.js';
import { EDU_EVENTS } from './core/events.js';

export class RetryWrong {
  constructor(options = {}) { this.eventTarget = options.eventTarget || (typeof document !== 'undefined' ? document : null); this.items = []; this.listener = (event) => { if (event.detail?.question) this.record(event.detail.question); }; if (this.eventTarget?.addEventListener) this.eventTarget.addEventListener(EDU_EVENTS.WRONG, this.listener); }
  record(question) { const duplicate = question && (question.id !== undefined ? this.items.some((item) => item.id === question.id) : this.items.includes(question)); if (question && !duplicate) this.items.push(question); return question; }
  getItems() { return [...this.items]; }
  count() { return this.items.length; }
  createPool(options = {}) { return new QuestionPool(this.items, options); }
  clear() { this.items = []; return this; }
  destroy() { this.eventTarget?.removeEventListener?.(EDU_EVENTS.WRONG, this.listener); }
}
