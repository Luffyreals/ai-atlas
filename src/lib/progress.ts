// Lessons the reader has marked as learned, kept in localStorage and shared by vi/en.
// No DOM imports: Storage and window are only touched inside functions. Never throws.
import type { LessonId } from '../data/roadmap';

export const PROGRESS_STORAGE_KEY = 'ai-atlas:progress:v1';
export const PROGRESS_EVENT = 'atlas:progress-change'; // CustomEvent on window, same-tab sync

export interface ProgressData {
  version: 1;
  lessons: Partial<Record<LessonId, { doneAt: string }>>; // ISO date; keyed by lesson id, shared by vi/en
}

export interface ProgressStore {
  available: boolean; // false when storage is missing or throws
  get(): ProgressData; // corrupt/missing data -> empty, never throws
  isDone(id: string): boolean;
  setDone(id: string, done: boolean): void; // falls back to memory when storage is blocked
  subscribe(listener: (data: ProgressData) => void): () => void; // 'storage' event + PROGRESS_EVENT
}

const PROBE_KEY = `${PROGRESS_STORAGE_KEY}:probe`;

function emptyData(): ProgressData {
  return { version: 1, lessons: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses stored JSON; anything unexpected becomes empty data, bad entries are dropped. */
function parseData(raw: string | null): ProgressData {
  if (raw === null) return emptyData();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyData();
  }
  if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.lessons)) return emptyData();
  const data = emptyData();
  for (const [id, entry] of Object.entries(parsed.lessons)) {
    if (isRecord(entry) && typeof entry.doneAt === 'string') {
      data.lessons[id as LessonId] = { doneAt: entry.doneAt };
    }
  }
  return data;
}

function copyData(data: ProgressData): ProgressData {
  return { version: 1, lessons: { ...data.lessons } };
}

function canUse(storage: Storage | null): storage is Storage {
  if (!storage) return false;
  try {
    storage.getItem(PROGRESS_STORAGE_KEY);
    storage.setItem(PROBE_KEY, '1');
    storage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** For tests: pass a fake Storage, one whose methods throw, or null. */
export function createProgressStore(storage: Storage | null, target?: EventTarget): ProgressStore {
  let available = canUse(storage);
  // Last known data; the only copy once storage is unavailable.
  let memory = emptyData();

  function get(): ProgressData {
    if (available && storage) {
      try {
        memory = parseData(storage.getItem(PROGRESS_STORAGE_KEY));
      } catch {
        available = false;
      }
    }
    return copyData(memory);
  }

  function isDone(id: string): boolean {
    return get().lessons[id as LessonId] !== undefined;
  }

  function setDone(id: string, done: boolean): void {
    const data = get();
    const key = id as LessonId;
    if (done) data.lessons[key] ??= { doneAt: new Date().toISOString() };
    else delete data.lessons[key];
    memory = data;
    if (available && storage) {
      try {
        storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
      } catch {
        available = false;
      }
    }
    target?.dispatchEvent(new CustomEvent<ProgressData>(PROGRESS_EVENT, { detail: copyData(data) }));
  }

  function subscribe(listener: (data: ProgressData) => void): () => void {
    if (!target) return () => {};
    const onChange = () => listener(get());
    // Other tabs: 'storage' fires only there, with key null when the whole storage was cleared.
    const onStorage = (event: Event) => {
      const { key } = event as StorageEvent;
      if (key === PROGRESS_STORAGE_KEY || key === null) onChange();
    };
    target.addEventListener(PROGRESS_EVENT, onChange);
    target.addEventListener('storage', onStorage);
    return () => {
      target.removeEventListener(PROGRESS_EVENT, onChange);
      target.removeEventListener('storage', onStorage);
    };
  }

  return {
    get available() {
      return available;
    },
    get,
    isDone,
    setDone,
    subscribe,
  };
}

let pageStore: ProgressStore | undefined;

/** The page-wide store over window.localStorage (created lazily, safe when access throws). */
export function getProgressStore(): ProgressStore {
  if (pageStore) return pageStore;
  const hasWindow = typeof window !== 'undefined';
  let storage: Storage | null = null;
  try {
    // Reading window.localStorage itself throws when the browser blocks storage.
    storage = hasWindow ? window.localStorage : null;
  } catch {
    storage = null;
  }
  pageStore = createProgressStore(storage, hasWindow ? window : undefined);
  return pageStore;
}

/** Pure: how many of `ids` are done. */
export function countDone(ids: readonly string[], isDone: (id: string) => boolean): number {
  return ids.filter((id) => isDone(id)).length;
}
