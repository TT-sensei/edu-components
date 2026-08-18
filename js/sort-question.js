import { QuestionComponent } from './question-component.js';

export class SortQuestion extends QuestionComponent {
  constructor(data = {}, options = {}) { super(data, { ...options, type: 'sort' }); this.items = [...(data.choices || data.items || [])]; this.selectedIndex = null; }
  getItems() { return [...this.items]; }
  select(index) { if (index < 0 || index >= this.items.length) return this.getItems(); if (this.selectedIndex === null) this.selectedIndex = index; else { [this.items[this.selectedIndex], this.items[index]] = [this.items[index], this.items[this.selectedIndex]]; this.selectedIndex = null; } return this.getItems(); }
  move(from, to) { if (from < 0 || to < 0 || from >= this.items.length || to >= this.items.length) return this.getItems(); const [item] = this.items.splice(from, 1); this.items.splice(to, 0, item); this.selectedIndex = null; return this.getItems(); }
  submit() { return this.result(this.items, this.question.answer, { comparator: (answer, correct, checker) => answer.length === correct.length && answer.every((item, index) => checker.normalize(item) === checker.normalize(correct[index])) }); }
}

