import { EDU_EVENTS, emit } from './core/events.js';

export class NewRecordJudge {
  constructor(options = {}) { this.eventTarget = options.eventTarget; this.isBetter = options.isBetter || ((current, best) => Number(current) > Number(best)); }
  judge(current, best) { const isNewRecord = best === null || best === undefined || this.isBetter(current, best); const detail = { current, best, isNewRecord }; if (isNewRecord) emit(this.eventTarget, EDU_EVENTS.NEW_RECORD, detail); return detail; }
}

