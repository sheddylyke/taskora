import type { Note, Priority, Task } from '../types';

/** Central place for every localStorage key used by Taskora. */
export const STORAGE_KEYS = {
  tasks: 'taskora.tasks.v1',
} as const;

/**
 * Read and validate data from localStorage.
 * Never throws - corrupted or unavailable storage falls back gracefully.
 */
export function loadFromStorage<T>(key: string, fallback: T, validate?: (raw: unknown) => T | null): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate) {
      return validate(parsed) ?? fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Persist a value to localStorage.
 * Returns `null` on success or an error message when storage is unavailable
 * (e.g. private browsing or a full/quota-exceeded quota).
 */
export function saveToStorage(key: string, value: unknown): string | null {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Taskora could not save your data to this browser (${message}).`;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toIsoString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return value;
  return fallback;
}

function sanitizeNote(raw: unknown): Note | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== 'string' || typeof raw.content !== 'string') return null;
  const now = new Date().toISOString();
  return {
    id: raw.id,
    content: raw.content,
    createdAt: toIsoString(raw.createdAt, now),
    updatedAt: toIsoString(raw.updatedAt, now),
  };
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function sanitizeTask(raw: unknown): Task | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string') return null;
  const now = new Date().toISOString();
  const priority: Priority = PRIORITIES.includes(raw.priority as Priority)
    ? (raw.priority as Priority)
    : 'medium';
  const notes = Array.isArray(raw.notes)
    ? raw.notes.map(sanitizeNote).filter((note): note is Note => note !== null)
    : [];
  return {
    id: raw.id,
    title: raw.title,
    description: typeof raw.description === 'string' ? raw.description : '',
    priority,
    completed: raw.completed === true,
    createdAt: toIsoString(raw.createdAt, now),
    updatedAt: toIsoString(raw.updatedAt, now),
    notes,
  };
}

/**
 * Validate whatever came out of localStorage so corrupted data can never
 * crash the app. Invalid entries are dropped instead of thrown away silently.
 */
export function sanitizeTasks(raw: unknown): Task[] | null {
  if (!Array.isArray(raw)) return null;
  const tasks = raw.map(sanitizeTask).filter((task): task is Task => task !== null);
  return tasks;
}
