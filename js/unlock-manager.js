import { EDU_EVENTS, emit } from './core/events.js';

const SAVE_VERSION = 1;

function normalizeId(id) {
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
}

export class UnlockManager {
  constructor(options = {}) {
    this.storage = options.storage || null;
    this.storageKey = options.storageKey || 'unlocks';
    this.eventTarget = options.eventTarget;
    const initial = options.initialUnlocked ?? options.initial ?? [];
    this.initialUnlocked = [...new Set((Array.isArray(initial) ? initial : [initial]).map(normalizeId).filter(Boolean))];
    this.unlocked = new Set(this.initialUnlocked);
    this._restore();
  }

  _restore() {
    if (!this.storage || typeof this.storage.load !== 'function') return;
    const saved = this.storage.load(this.storageKey, null);
    if (!saved || !Array.isArray(saved.unlocked)) return;
    this.unlocked = new Set(saved.unlocked.map(normalizeId).filter(Boolean));
  }

  _save() {
    if (!this.storage || typeof this.storage.save !== 'function') return;
    this.storage.save(this.storageKey, { version: SAVE_VERSION, unlocked: this.getUnlocked() });
  }

  _notify(name, id, unlocked) {
    emit(this.eventTarget, name, {
      id,
      unlocked,
      unlockedCount: this.unlocked.size
    });
    return unlocked;
  }

  unlock(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId || this.unlocked.has(normalizedId)) return false;
    this.unlocked.add(normalizedId);
    this._save();
    this._notify(EDU_EVENTS.UNLOCK, normalizedId, true);
    return true;
  }

  lock(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId || !this.unlocked.has(normalizedId)) return false;
    this.unlocked.delete(normalizedId);
    this._save();
    this._notify(EDU_EVENTS.LOCK, normalizedId, false);
    return true;
  }

  isUnlocked(id) {
    const normalizedId = normalizeId(id);
    return Boolean(normalizedId && this.unlocked.has(normalizedId));
  }

  getUnlocked() { return [...this.unlocked]; }

  reset() {
    const previous = new Set(this.unlocked);
    this.unlocked = new Set(this.initialUnlocked);
    this._save();
    for (const id of previous) if (!this.unlocked.has(id)) this._notify(EDU_EVENTS.LOCK, id, false);
    for (const id of this.unlocked) if (!previous.has(id)) this._notify(EDU_EVENTS.UNLOCK, id, true);
    return this.getUnlocked();
  }
}
