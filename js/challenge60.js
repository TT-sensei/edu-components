import { TimeAttack } from './time-attack.js';

export class Challenge60 extends TimeAttack {
  constructor(options = {}) { super({ ...options, duration: options.duration ?? options.seconds ?? 60 }); }
}

