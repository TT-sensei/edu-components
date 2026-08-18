export class ScoreManager {
  constructor(options = {}) { this.eventTarget = options.eventTarget; this.reset(); }
  add(points = 0) { this.score += Number(points) || 0; return this.score; }
  subtract(points = 0) { return this.add(-(Number(points) || 0)); }
  correct(points = 1) { this.correctCount += 1; this.total += 1; this.add(points); return this.getResult(); }
  wrong(points = 0) { this.wrongCount += 1; this.total += 1; this.subtract(points); return this.getResult(); }
  setTotal(total) { this.total = Math.max(0, Number(total) || 0); return this; }
  reset() { this.score = 0; this.correctCount = 0; this.wrongCount = 0; this.total = 0; return this; }
  get accuracy() { return this.total ? Math.round((this.correctCount / this.total) * 1000) / 10 : 0; }
  getResult() { return { score: this.score, correct: this.correctCount, wrong: this.wrongCount, total: this.total, accuracy: this.accuracy }; }
}

