import { EDU_EVENTS, emit } from './core/events.js';

const SAVE_VERSION = 1;

function normalizeId(id) {
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
}

/**
 * 学習項目の完了状況だけを管理する部品。
 * 保存が必要な場合は StorageManager を options.storage に渡す。
 */
export class ProgressManager {
  constructor(options = {}) {
    this.storage = options.storage || null;
    this.storageKey = options.storageKey || 'progress';
    this.eventTarget = options.eventTarget;
    this.total = Number.isFinite(Number(options.total))
      ? Math.max(0, Math.floor(Number(options.total)))
      : null;
    this.managedIds = Array.isArray(options.ids)
      ? [...new Set(options.ids.map(normalizeId).filter(Boolean))]
      : null;
    if (this.total === null && this.managedIds) this.total = this.managedIds.length;
    this.completed = new Set();
    this._wasComplete = false;
    this._restore();
  }

  _restore() {
    if (!this.storage || typeof this.storage.load !== 'function') return;
    const saved = this.storage.load(this.storageKey, null);
    if (!saved || !Array.isArray(saved.completed)) return;
    this.completed = new Set(saved.completed.map(normalizeId).filter(Boolean));
    this._wasComplete = this.getPercent() === 100;
  }

  _save() {
    if (!this.storage || typeof this.storage.save !== 'function') return;
    this.storage.save(this.storageKey, {
      version: SAVE_VERSION,
      completed: this.getCompleted()
    });
  }

  _detail(id = null) {
    return {
      id,
      completed: id === null ? false : this.isCompleted(id),
      completedCount: this.getCompletedCount(),
      total: this.getTotal(),
      percent: this.getPercent()
    };
  }

  _notify(id = null) {
    const detail = this._detail(id);
    emit(this.eventTarget, EDU_EVENTS.PROGRESS, detail);
    if (detail.percent === 100 && !this._wasComplete) {
      emit(this.eventTarget, EDU_EVENTS.COMPLETE, {
        type: 'progress',
        value: detail.percent,
        result: detail
      });
    }
    this._wasComplete = detail.percent === 100;
    return detail;
  }

  complete(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return false;
    if (this.managedIds && !this.managedIds.includes(normalizedId)) return false;
    const changed = !this.completed.has(normalizedId);
    this.completed.add(normalizedId);
    if (changed) {
      this._save();
      this._notify(normalizedId);
    }
    return changed;
  }

  uncomplete(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId || !this.completed.has(normalizedId)) return false;
    this.completed.delete(normalizedId);
    this._save();
    this._notify(normalizedId);
    return true;
  }

  isCompleted(id) {
    const normalizedId = normalizeId(id);
    return Boolean(normalizedId && this.completed.has(normalizedId));
  }

  getCompleted() {
    if (!this.managedIds) return [...this.completed];
    return this.managedIds.filter((id) => this.completed.has(id));
  }

  getCompletedCount() {
    return this.getCompleted().length;
  }

  getTotal() {
    return this.total === null ? this.completed.size : this.total;
  }

  getPercent() {
    const total = this.getTotal();
    if (total === 0) return 0;
    return Math.min(100, Math.round((this.getCompletedCount() / total) * 100));
  }

  reset() {
    const hadProgress = this.completed.size > 0;
    this.completed.clear();
    this._save();
    if (hadProgress || this._wasComplete) this._notify(null);
    else this._wasComplete = false;
    return hadProgress;
  }
}
