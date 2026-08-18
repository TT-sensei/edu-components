import { QuestionComponent } from './question-component.js';

export class MultiSelect extends QuestionComponent {
  constructor(data = {}, options = {}) { super(data, { ...options, type: 'multi-select' }); this.choices = [...(data.choices || [])]; this.selected = new Set(); this.required = options.required ?? (Array.isArray(data.answer) ? data.answer.length : 1); }
  toggle(choice) { if (this.selected.has(choice)) this.selected.delete(choice); else if (this.selected.size < this.required) this.selected.add(choice); return this.getSelected(); }
  getSelected() { return [...this.selected]; }
  submit() { return this.result(this.getSelected(), this.question.answer, { comparator: (answer, correct, checker) => answer.length === correct.length && correct.every((item) => answer.some((selected) => checker.normalize(selected) === checker.normalize(item))) }); }
  reset(data = this.question) { super.reset(data); this.choices = [...(data.choices || [])]; this.selected.clear(); return this; }
}

