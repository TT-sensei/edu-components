import { QuestionComponent } from './question-component.js';

export class InputQuestion extends QuestionComponent {
  constructor(data = {}, options = {}) { super(data, { ...options, type: 'input' }); }
  submit(value) { return this.result(value, this.question.answer); }
  bindInput(input) {
    input.setAttribute('inputmode', 'text');
    const handler = (event) => { if (event.key === 'Enter') { event.preventDefault(); this.submit(input.value); } };
    input.addEventListener('keydown', handler);
    return () => input.removeEventListener('keydown', handler);
  }
}

