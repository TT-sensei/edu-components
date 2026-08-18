import { QuestionComponent } from './question-component.js';

export class ChoiceQuestion extends QuestionComponent {
  constructor(data = {}, options = {}) {
    super(data, { ...options, type: 'choice' });
    if (!Array.isArray(data.choices) || data.choices.length < 2 || data.choices.length > 4) throw new Error('ChoiceQuestion requires 2 to 4 choices.');
    this.shuffle = options.shuffle ?? true;
    this.choices = this.shuffle ? [...data.choices].sort(() => Math.random() - 0.5) : [...data.choices];
  }
  getChoices() { return [...this.choices]; }
  choose(choice) { return this.result(choice, this.question.answer); }
  reset(data = this.question) { super.reset(data); this.choices = (data.choices || []).slice(); if (this.shuffle) this.choices.sort(() => Math.random() - 0.5); return this; }
}

