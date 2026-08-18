export const EDU_EVENTS = Object.freeze({
  CORRECT: 'edu:correct',
  WRONG: 'edu:wrong',
  SCREEN_CHANGE: 'edu:screenchange',
  COMBO: 'edu:combo',
  COMPLETE: 'edu:complete'
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

