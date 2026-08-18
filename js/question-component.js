import { AnswerChecker } from './answer-checker.js';

export class QuestionComponent {
  constructor(data = {}, options = {}) {
    this.question = data;
    this.type = data.type || options.type || 'question';
    this.eventTarget = options.eventTarget;
    this.checker = options.checker || new AnswerChecker({ eventTarget: this.eventTarget, ignoreCase: options.ignoreCase ?? true });
    this.answered = false;
  }

  result(answer, correct = this.question.answer, options = {}) {
    if (this.answered) return { ignored: true, isCorrect: false };
    this.answered = true;
    const isCorrect = this.checker.check(answer, correct, { ...options, detail: { question: this.question, type: this.type, ...(options.detail || {}) } });
    return { ignored: false, isCorrect, question: this.question };
  }

  reset(data = this.question) { this.question = data; this.answered = false; return this; }
  getData() { return this.question; }
}

