export class QuestionPool {
  constructor(items = [], options = {}) {
    this.items = [...items];
    this.mode = options.mode === 'sequential' ? 'sequential' : 'random';
    this.used = new Set();
    this.cursor = 0;
  }

  setItems(items) { this.items = [...items]; this.reset(); return this; }
  reset() { this.used.clear(); this.cursor = 0; return this; }
  get remaining() { return Math.max(0, this.items.length - this.used.size); }
  get allUsed() { return this.items.length > 0 && this.remaining === 0; }
  getRemaining(criteria = {}) { return this.filter(criteria).filter((item) => !this.used.has(item)).length; }

  filter(criteria = {}) {
    return this.items.filter((item) => Object.entries(criteria).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return Array.isArray(value) ? value.includes(item[key]) : item[key] === value;
    }));
  }

  next(criteria = {}) {
    const candidates = this.filter(criteria).filter((item) => !this.used.has(item));
    if (!candidates.length) return null;
    const item = this.mode === 'sequential' ? candidates[0] : candidates[Math.floor(Math.random() * candidates.length)];
    this.used.add(item);
    return item;
  }

  take(count = 1, criteria = {}) {
    const result = [];
    const amount = Math.max(0, Number(count) || 0);
    while (result.length < amount) {
      const item = this.next(criteria);
      if (!item) break;
      result.push(item);
    }
    return result;
  }

  getUsed() { return [...this.used]; }
}
