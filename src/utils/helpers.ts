import type { Priority, Task, TaskFilter, TaskFormErrors, TaskStats, TaskDraft } from '../types';

export const TASK_TITLE_MAX = 100;
export const TASK_DESCRIPTION_MAX = 500;
export const NOTE_MAX = 500;

/** Options used by the filter tabs and the sidebar navigation. */
export const FILTER_OPTIONS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

/** Visual metadata for each priority level. */
export const PRIORITY_META: Record<
  Priority,
  { label: string; badge: string; dot: string; cardEdge: string }
> = {
  low: {
    label: 'Low',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
    cardEdge: 'before:bg-emerald-500',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
    cardEdge: 'before:bg-amber-500',
  },
  high: {
    label: 'High',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
    cardEdge: 'before:bg-rose-500',
  },
};

/** Generate a collision-safe unique id (with a fallback for older browsers). */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Format an ISO timestamp as e.g. "Sep 30, 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/** Case-insensitive match against the task title or description. */
export function matchesSearch(task: Task, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    task.title.toLowerCase().includes(normalized) ||
    task.description.toLowerCase().includes(normalized)
  );
}

/** Apply the active filter, then the search query, then sort newest first. */
export function getVisibleTasks(tasks: Task[], filter: TaskFilter, query: string): Task[] {
  return tasks
    .filter((task) => {
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      return matchesSearch(task, query);
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

/** Compute the total / active / completed counters. */
export function getStats(tasks: Task[]): TaskStats {
  const completed = tasks.filter((task) => task.completed).length;
  return { total: tasks.length, active: tasks.length - completed, completed };
}

/** Validate the task form. Returns an empty object when the input is valid. */
export function validateTaskForm(draft: TaskDraft): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = draft.title.trim();

  if (!title) {
    errors.title = 'Please enter a task title.';
  } else if (title.length > TASK_TITLE_MAX) {
    errors.title = `Title must be ${TASK_TITLE_MAX} characters or fewer.`;
  }

  if (draft.description.length > TASK_DESCRIPTION_MAX) {
    errors.description = `Description must be ${TASK_DESCRIPTION_MAX} characters or fewer.`;
  }

  return errors;
}

/** Validate a note's content. Returns an error message or `null` when valid. */
export function validateNote(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) return 'Please write something before adding a note.';
  if (trimmed.length > NOTE_MAX) return `Notes must be ${NOTE_MAX} characters or fewer.`;
  return null;
}
