import { QuestionPool } from './question-pool.js';

export class RetryWrong {
  constructor(options = {}) { this.eventTarget = options.eventTarget || (typeof document !== 'undefined' ? document : null); this.items = []; this.listener = (event) => { if (event.detail?.question) this.record(event.detail.question); }; if (this.eventTarget?.addEventListener) this.eventTarget.addEventListener('edu:wrong', this.listener); }
  record(question) { if (question && !this.items.includes(question)) this.items.push(question); return question; }
  getItems() { return [...this.items]; }
  count() { return this.items.length; }
  createPool(options = {}) { return new QuestionPool(this.items, options); }
  clear() { this.items = []; return this; }
  destroy() { this.eventTarget?.removeEventListener?.('edu:wrong', this.listener); }
}

