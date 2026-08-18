import { InputQuestion } from './input-question.js';

export class NumberInput extends InputQuestion {
  constructor(data = {}, options = {}) { super(data, { ...options, type: 'number-input' }); this.value = ''; }
  press(key) {
    if (key === 'clear') this.value = '';
    else if (key === 'delete') this.value = this.value.slice(0, -1);
    else if (/^\d$/.test(String(key))) this.value += String(key);
    else if (key === 'enter') return this.submit(this.value);
    return this.value;
  }
  createKeypad(container, onResult) {
    const keys = ['1','2','3','4','5','6','7','8','9','delete','0','clear','enter'];
    container.classList.add('edu-number-keypad');
    keys.forEach((key) => { const button = document.createElement('button'); button.type = 'button'; button.dataset.key = key; button.textContent = key === 'delete' ? '消す' : key === 'clear' ? '全消去' : key === 'enter' ? '決定' : key; button.addEventListener('click', () => { const result = this.press(key); if (onResult) onResult(result, key); }); container.append(button); });
    return container;
  }
}

