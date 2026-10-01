/**
 * Shared TypeScript types for Taskora.
 */

/** Priority levels a task can have. */
export type Priority = 'low' | 'medium' | 'high';

/** Which subset of tasks the list is currently showing. */
export type TaskFilter = 'all' | 'active' | 'completed';

/** A note attached to a single task. */
export interface Note {
  id: string;
  content: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

/** A task in Taskora. */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
  notes: Note[];
}

/** The data collected by the add/edit task form. */
export interface TaskDraft {
  title: string;
  description: string;
  priority: Priority;
}

/** Summary counters shown in the dashboard. */
export interface TaskStats {
  total: number;
  active: number;
  completed: number;
}

/** Validation errors keyed by form field. */
export type TaskFormErrors = Partial<Record<'title' | 'description', string>>;
