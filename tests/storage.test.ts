import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import type { Task } from '../src/types/index.ts';
import {
  STORAGE_KEYS,
  loadFromStorage,
  sanitizeTasks,
  saveToStorage,
} from '../src/utils/storage.ts';

// --- localStorage stub (simulates the browser) -----------------------------
const store = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  },
};

const browserWindow = globalThis as unknown as {
  window: { localStorage: { setItem: (k: string, v: string) => void } };
};

beforeEach(() => {
  store.clear();
  // Restore a working setItem in case a previous test replaced it.
  browserWindow.window.localStorage.setItem = (key: string, value: string) => {
    store.set(key, value);
  };
});

const T0 = '2026-10-01T10:00:00.000Z';

function sampleTask(): Task {
  return {
    id: 'task-1',
    title: 'Ship Taskora',
    description: 'HNG stage 1',
    priority: 'high',
    completed: false,
    createdAt: T0,
    updatedAt: T0,
    notes: [{ id: 'note-1', content: 'remember the README', createdAt: T0, updatedAt: T0 }],
  };
}

describe('data persistence (localStorage)', () => {
  test('uses the documented storage key', () => {
    assert.equal(STORAGE_KEYS.tasks, 'taskora.tasks.v1');
  });

  test('save then load round-trips tasks and notes (simulated refresh)', () => {
    const tasks = [sampleTask()];
    const error = saveToStorage(STORAGE_KEYS.tasks, tasks);
    assert.equal(error, null);

    // A "page refresh" only differs by reading the key again.
    const loaded = loadFromStorage(STORAGE_KEYS.tasks, [] as Task[], sanitizeTasks);
    assert.deepEqual(loaded, tasks);
    assert.equal(loaded[0].notes[0].content, 'remember the README');
  });

  test('missing key returns the fallback', () => {
    assert.deepEqual(loadFromStorage('never-written', [] as Task[], sanitizeTasks), []);
  });

  test('corrupted JSON never throws and returns the fallback', () => {
    store.set(STORAGE_KEYS.tasks, '{definitely not json');
    assert.deepEqual(loadFromStorage(STORAGE_KEYS.tasks, [] as Task[], sanitizeTasks), []);
  });

  test('saveToStorage returns an error message instead of throwing', () => {
    browserWindow.window.localStorage.setItem = () => {
      throw new Error('quota exceeded');
    };
    const result = saveToStorage(STORAGE_KEYS.tasks, []);
    assert.ok(typeof result === 'string' && result.includes('quota exceeded'));
  });
});

describe('stored data sanitization', () => {
  test('sanitizeTasks rejects non-array payloads', () => {
    assert.equal(sanitizeTasks('nope'), null);
    assert.equal(sanitizeTasks({ tasks: [] }), null);
    assert.equal(sanitizeTasks(null), null);
  });

  test('drops invalid entries and repairs bad fields', () => {
    const cleaned = sanitizeTasks([
      null,
      42,
      { bogus: true },
      { id: 'ok', title: 'Valid', priority: 'weird', completed: 'yes', notes: [{ junk: 1 }] },
    ]);
    assert.ok(cleaned);
    assert.equal(cleaned.length, 1);
    assert.equal(cleaned[0].priority, 'medium'); // repaired default
    assert.equal(cleaned[0].completed, false); // only true when literally true
    assert.deepEqual(cleaned[0].notes, []); // invalid notes dropped
    assert.equal(cleaned[0].description, ''); // missing description defaulted
  });

  test('keeps valid notes and valid priorities', () => {
    const cleaned = sanitizeTasks([
      {
        id: 'x',
        title: 'Kept',
        description: 'kept too',
        priority: 'low',
        completed: true,
        createdAt: T0,
        updatedAt: T0,
        notes: [{ id: 'n', content: 'valid note', createdAt: T0, updatedAt: T0 }, { broken: true }],
      },
    ]);
    assert.ok(cleaned);
    assert.equal(cleaned[0].priority, 'low');
    assert.equal(cleaned[0].completed, true);
    assert.equal(cleaned[0].notes.length, 1);
    assert.equal(cleaned[0].notes[0].content, 'valid note');
  });

  test('invalid timestamps fall back to the current time', () => {
    const cleaned = sanitizeTasks([
      { id: 'x', title: 'T', createdAt: 'garbage', updatedAt: 12345 },
    ]);
    assert.ok(cleaned);
    assert.ok(!Number.isNaN(Date.parse(cleaned[0].createdAt)));
    assert.ok(!Number.isNaN(Date.parse(cleaned[0].updatedAt)));
  });
});
