import { EDU_EVENTS, emit } from './core/events.js';

const SAVE_VERSION = 1;

function normalizeId(id) {
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
}

function definitionsToMap(definitions) {
  const list = Array.isArray(definitions)
    ? definitions
    : Object.entries(definitions || {}).map(([id, value]) => ({ id, ...value }));
  return new Map(list.map((definition) => [normalizeId(definition?.id), { ...definition, id: normalizeId(definition?.id) }]).filter(([id]) => id));
}

export class AchievementManager {
  constructor(options = {}) {
    this.storage = options.storage || null;
    this.storageKey = options.storageKey || 'achievements';
    this.eventTarget = options.eventTarget;
    this.achievements = definitionsToMap(options.achievements);
    this.achieved = new Set();
    this._restore();
  }

  register(achievement) {
    const id = normalizeId(achievement?.id);
    if (!id) return false;
    this.achievements.set(id, { ...achievement, id });
    return true;
  }

  registerAll(achievements = []) {
    const list = Array.isArray(achievements) ? achievements : Object.values(achievements);
    list.forEach((achievement) => this.register(achievement));
    return this;
  }

  getDefinition(id) {
    return this.achievements.get(normalizeId(id)) || null;
  }

  _restore() {
    if (!this.storage || typeof this.storage.load !== 'function') return;
    const saved = this.storage.load(this.storageKey, null);
    if (saved && Array.isArray(saved.achieved)) this.achieved = new Set(saved.achieved.map(normalizeId).filter(Boolean));
  }

  _save() {
    if (!this.storage || typeof this.storage.save !== 'function') return;
    this.storage.save(this.storageKey, { version: SAVE_VERSION, achieved: this.getAchieved() });
  }

  achieve(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId || this.achieved.has(normalizedId)) return false;
    this.achieved.add(normalizedId);
    this._save();
    emit(this.eventTarget, EDU_EVENTS.ACHIEVEMENT, {
      id: normalizedId,
      achievement: this.getDefinition(normalizedId) || { id: normalizedId },
      achievedCount: this.achieved.size
    });
    return true;
  }

  unachieve(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId || !this.achieved.has(normalizedId)) return false;
    this.achieved.delete(normalizedId);
    this._save();
    return true;
  }

  isAchieved(id) {
    const normalizedId = normalizeId(id);
    return Boolean(normalizedId && this.achieved.has(normalizedId));
  }

  getAchieved() { return [...this.achieved]; }
  getAchievedCount() { return this.achieved.size; }

  reset() {
    const changed = this.achieved.size > 0;
    this.achieved.clear();
    this._save();
    return changed;
  }
}
