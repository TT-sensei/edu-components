import { QuestionComponent } from './question-component.js';
import { shuffle } from './core/events.js';

export class ChoiceQuestion extends QuestionComponent {
  constructor(data = {}, options = {}) {
    super(data, { ...options, type: 'choice' });
    if (!Array.isArray(data.choices) || data.choices.length < 2 || data.choices.length > 4) throw new Error('ChoiceQuestion requires 2 to 4 choices.');
    this.shuffle = options.shuffle ?? true;
    this.choices = this.shuffle ? shuffle(data.choices) : [...data.choices];
  }
  getChoices() { return [...this.choices]; }
  choose(choice) { return this.result(choice, this.question.answer); }
  reset(data = this.question) { super.reset(data); this.choices = this.shuffle ? shuffle(data.choices || []) : [...(data.choices || [])]; return this; }
}
