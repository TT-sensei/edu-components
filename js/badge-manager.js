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

export class BadgeManager {
  constructor(options = {}) {
    this.storage = options.storage || null;
    this.storageKey = options.storageKey || 'badges';
    this.eventTarget = options.eventTarget;
    this.badges = definitionsToMap(options.badges);
    this.awarded = new Set();
    this._restore();
  }

  register(badge) {
    const id = normalizeId(badge?.id);
    if (!id) return false;
    this.badges.set(id, { ...badge, id });
    return true;
  }

  registerAll(badges = []) {
    const list = Array.isArray(badges) ? badges : Object.values(badges);
    list.forEach((badge) => this.register(badge));
    return this;
  }

  getDefinition(id) {
    return this.badges.get(normalizeId(id)) || null;
  }

  _restore() {
    if (!this.storage || typeof this.storage.load !== 'function') return;
    const saved = this.storage.load(this.storageKey, null);
    if (saved && Array.isArray(saved.awarded)) this.awarded = new Set(saved.awarded.map(normalizeId).filter(Boolean));
  }

  _save() {
    if (!this.storage || typeof this.storage.save !== 'function') return;
    this.storage.save(this.storageKey, { version: SAVE_VERSION, awarded: this.getAwarded() });
  }

  award(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId || this.awarded.has(normalizedId)) return false;
    this.awarded.add(normalizedId);
    this._save();
    emit(this.eventTarget, EDU_EVENTS.BADGE, {
      id: normalizedId,
      badge: this.getDefinition(normalizedId) || { id: normalizedId },
      awardedCount: this.awarded.size
    });
    return true;
  }

  revoke(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId || !this.awarded.has(normalizedId)) return false;
    this.awarded.delete(normalizedId);
    this._save();
    return true;
  }

  has(id) {
    const normalizedId = normalizeId(id);
    return Boolean(normalizedId && this.awarded.has(normalizedId));
  }

  getAwarded() { return [...this.awarded]; }
  getAwardedCount() { return this.awarded.size; }

  reset() {
    const changed = this.awarded.size > 0;
    this.awarded.clear();
    this._save();
    return changed;
  }
}
