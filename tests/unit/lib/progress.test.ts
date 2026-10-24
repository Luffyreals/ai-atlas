import { describe, expect, it, vi } from 'vitest';
import { PROGRESS_EVENT, PROGRESS_STORAGE_KEY, countDone, createProgressStore } from '../../../src/lib/progress';

/** Minimal in-memory Storage. */
function memoryStorage(initial: Record<string, string> = {}): Storage {
  const items = new Map(Object.entries(initial));
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  };
}

/** A Storage whose every method throws, like a browser that blocks storage. */
function throwingStorage(): Storage {
  const fail = () => {
    throw new DOMException('blocked', 'SecurityError');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}

function storageEvent(key: string | null): Event {
  return Object.assign(new Event('storage'), { key });
}

describe('createProgressStore', () => {
  it('stores done lessons as JSON under the versioned key', () => {
    const storage = memoryStorage();
    const store = createProgressStore(storage);
    expect(store.available).toBe(true);
    expect(store.isDone('ml/linear-regression')).toBe(false);

    store.setDone('ml/linear-regression', true);
    expect(store.isDone('ml/linear-regression')).toBe(true);
    const saved = JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY) ?? '');
    expect(saved.version).toBe(1);
    expect(Number.isNaN(Date.parse(saved.lessons['ml/linear-regression'].doneAt))).toBe(false);

    store.setDone('ml/linear-regression', false);
    expect(store.isDone('ml/linear-regression')).toBe(false);
    expect(store.get()).toEqual({ version: 1, lessons: {} });
  });

  it('keeps the first doneAt when marked done twice', () => {
    const doneAt = '2026-10-01T00:00:00.000Z';
    const storage = memoryStorage({
      [PROGRESS_STORAGE_KEY]: JSON.stringify({ version: 1, lessons: { 'ml/linear-regression': { doneAt } } }),
    });
    const store = createProgressStore(storage);
    store.setDone('ml/linear-regression', true);
    expect(store.get().lessons['ml/linear-regression']?.doneAt).toBe(doneAt);
  });

  it('works in memory without storage (null), never throwing', () => {
    const store = createProgressStore(null);
    expect(store.available).toBe(false);
    expect(() => store.setDone('ml/linear-regression', true)).not.toThrow();
    expect(store.isDone('ml/linear-regression')).toBe(true);
  });

  it('works in memory when every storage method throws', () => {
    const store = createProgressStore(throwingStorage());
    expect(store.available).toBe(false);
    expect(() => store.get()).not.toThrow();
    expect(() => store.setDone('ml/linear-regression', true)).not.toThrow();
    expect(store.isDone('ml/linear-regression')).toBe(true);
  });

  it('falls back to memory when a later write throws', () => {
    const storage = memoryStorage();
    const store = createProgressStore(storage);
    storage.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    expect(() => store.setDone('ml/linear-regression', true)).not.toThrow();
    expect(store.available).toBe(false);
    expect(store.isDone('ml/linear-regression')).toBe(true);
  });

  it.each([
    ['not JSON', '{oops'],
    ['null', 'null'],
    ['an array', '[]'],
    ['another version', JSON.stringify({ version: 2, lessons: { 'ml/linear-regression': { doneAt: 'x' } } })],
    ['lessons not an object', JSON.stringify({ version: 1, lessons: 'ml/linear-regression' })],
  ])('reads corrupt data (%s) as empty', (_label, raw) => {
    const store = createProgressStore(memoryStorage({ [PROGRESS_STORAGE_KEY]: raw }));
    expect(store.get()).toEqual({ version: 1, lessons: {} });
  });

  it('drops entries without a string doneAt', () => {
    const raw = JSON.stringify({
      version: 1,
      lessons: { 'ml/linear-regression': { doneAt: '2026-10-01' }, 'ml/pca': true, 'ml/svm': { doneAt: 1 } },
    });
    const store = createProgressStore(memoryStorage({ [PROGRESS_STORAGE_KEY]: raw }));
    expect(Object.keys(store.get().lessons)).toEqual(['ml/linear-regression']);
  });

  it('get() returns a copy', () => {
    const store = createProgressStore(memoryStorage());
    store.get().lessons['ml/linear-regression'] = { doneAt: 'x' };
    expect(store.isDone('ml/linear-regression')).toBe(false);
  });

  it('notifies subscribers in this tab and from other tabs, until unsubscribed', () => {
    const storage = memoryStorage();
    const target = new EventTarget();
    const store = createProgressStore(storage, target);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.setDone('ml/linear-regression', true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0].lessons).toHaveProperty(['ml/linear-regression']);

    // Another tab wrote the key: the store reads the new value.
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 1, lessons: {} }));
    target.dispatchEvent(storageEvent(PROGRESS_STORAGE_KEY));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1]?.[0]).toEqual({ version: 1, lessons: {} });

    target.dispatchEvent(storageEvent('some-other-key'));
    target.dispatchEvent(storageEvent(null)); // storage.clear() in another tab
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    store.setDone('ml/pca', true);
    target.dispatchEvent(storageEvent(PROGRESS_STORAGE_KEY));
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('dispatches PROGRESS_EVENT with the new data', () => {
    const target = new EventTarget();
    const seen: unknown[] = [];
    target.addEventListener(PROGRESS_EVENT, (event) => seen.push((event as CustomEvent).detail));
    createProgressStore(null, target).setDone('ml/pca', true);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ version: 1, lessons: { 'ml/pca': {} } });
  });

  it('subscribe without a target is a no-op', () => {
    const unsubscribe = createProgressStore(memoryStorage()).subscribe(() => {});
    expect(() => unsubscribe()).not.toThrow();
  });
});

describe('countDone', () => {
  it('counts only the done ids', () => {
    const done = new Set(['a', 'c']);
    expect(countDone(['a', 'b', 'c', 'd'], (id) => done.has(id))).toBe(2);
    expect(countDone([], () => true)).toBe(0);
  });
});
