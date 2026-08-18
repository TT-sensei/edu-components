import { EDU_EVENTS, emit } from './core/events.js';

export class ScreenManager {
  constructor(options = {}) {
    this.screens = new Map();
    this.currentScreen = null;
    this.eventTarget = options.eventTarget;
    this.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    (options.screens || []).forEach((screen) => this.register(screen));
  }

  register(screenOrId, element) {
    const id = typeof screenOrId === 'string' ? screenOrId : screenOrId?.id;
    const node = typeof screenOrId === 'string' ? element : screenOrId;
    if (!id || !node) throw new Error('ScreenManager.register requires an id and an element.');
    this.screens.set(id, node);
    node.hidden = true;
    node.setAttribute('aria-hidden', 'true');
    return this;
  }

  show(id, options = {}) {
    if (!this.screens.has(id)) throw new Error(`Unknown screen: ${id}`);
    const previous = this.currentScreen;
    this.screens.forEach((node, screenId) => {
      const active = screenId === id;
      node.hidden = !active;
      node.setAttribute('aria-hidden', String(!active));
      node.classList.toggle('is-active', active);
    });
    this.currentScreen = id;
    if (options.scroll !== false && typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
    emit(this.eventTarget, EDU_EVENTS.SCREEN_CHANGE, { from: previous, to: id });
    return this;
  }

  getCurrent() { return this.currentScreen; }
  setBackHandler(handler) { this.onBack = typeof handler === 'function' ? handler : null; return this; }
  back(...args) { return this.onBack ? this.onBack(this.currentScreen, ...args) : undefined; }
}

