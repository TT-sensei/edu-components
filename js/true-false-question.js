import { ChoiceQuestion } from './choice-question.js';

export class TrueFalseQuestion extends ChoiceQuestion {
  constructor(data = {}, options = {}) {
    const normalized = { ...data, type: 'true-false', choices: ['○', '×'], answer: data.answer === true ? '○' : data.answer === false ? '×' : data.answer };
    super(normalized, { ...options, shuffle: false });
  }
  choose(value) { const choice = value === true ? '○' : value === false ? '×' : value; return this.result(choice, this.question.answer); }
  reset(data = this.question) { const normalized = { ...data, type: 'true-false', choices: ['○', '×'], answer: data.answer === true ? '○' : data.answer === false ? '×' : data.answer }; return super.reset(normalized); }
}
