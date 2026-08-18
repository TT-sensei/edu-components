export const EDU_EVENTS = Object.freeze({
  CORRECT: 'edu:correct',
  WRONG: 'edu:wrong',
  SCREEN_CHANGE: 'edu:screenchange',
  COMBO: 'edu:combo',
  COMPLETE: 'edu:complete',
  TIMER_START: 'edu:timerstart',
  TIMER_WARNING: 'edu:timerwarning',
  TIMEUP: 'edu:timeup',
  NEW_RECORD: 'edu:newrecord',
  RANK: 'edu:rank',
  STORAGE_SAVE: 'edu:storagesave',
  STORAGE_REMOVE: 'edu:storageremove',
  STORAGE_CLEAR: 'edu:storageclear',
  STORAGE_ERROR: 'edu:storageerror',
  PROGRESS: 'edu:progress'
});

export function resolveEventTarget(target) {
  if (target && typeof target.dispatchEvent === 'function') return target;
  if (typeof document !== 'undefined') return document;
  return new EventTarget();
}

export function emit(target, name, detail = {}) {
  const eventTarget = resolveEventTarget(target);
  eventTarget.dispatchEvent(new CustomEvent(name, { detail }));
}

export function shuffle(items = []) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
