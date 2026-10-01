import type { Note, Task, TaskDraft } from '../types';
import { createId } from './helpers.ts';

/**
 * Pure, immutable task/note state transitions.
 *
 * These functions contain ALL of Taskora's core application logic so they can
 * be unit-tested directly (see tests/) without React or a DOM. The useTasks
 * hook is a thin wrapper that pipes these results into persisted state.
 *
 * NOTE: This file is executed by Node's test runner via native type stripping,
 * so its relative imports MUST use explicit `.ts` extensions.
 */

const iso = () => new Date().toISOString();

/** Build a brand-new task from validated form input. */
export function buildTask(draft: TaskDraft, now: string = iso()): Task {
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    priority: draft.priority,
    completed: false,
    createdAt: now,
    updatedAt: now,
    notes: [],
  };
}

/** Return a new list with one task's editable fields updated. Unknown ids are a no-op. */
export function withUpdatedTask(
  tasks: Task[],
  id: string,
  draft: TaskDraft,
  now: string = iso(),
): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          title: draft.title.trim(),
          description: draft.description.trim(),
          priority: draft.priority,
          updatedAt: now,
        }
      : task,
  );
}

/** Return a new list without the task `id`. Unknown ids are a no-op. */
export function withoutTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

/** Toggle a task between active and completed. Unknown ids are a no-op. */
export function withToggledTask(tasks: Task[], id: string, now: string = iso()): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed, updatedAt: now } : task,
  );
}

function buildNote(content: string, now: string): Note {
  return { id: createId(), content: content.trim(), createdAt: now, updatedAt: now };
}

/** Prepend a new note to a task (newest first) and bump the task's updatedAt. */
export function withAddedNote(
  tasks: Task[],
  taskId: string,
  content: string,
  now: string = iso(),
): Task[] {
  const note = buildNote(content, now);
  return tasks.map((task) =>
    task.id === taskId ? { ...task, notes: [note, ...task.notes], updatedAt: now } : task,
  );
}

/** Edit one note's content and bump its updatedAt. Unknown ids are a no-op. */
export function withUpdatedNote(
  tasks: Task[],
  taskId: string,
  noteId: string,
  content: string,
  now: string = iso(),
): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      notes: task.notes.map((note) =>
        note.id === noteId ? { ...note, content: content.trim(), updatedAt: now } : note,
      ),
    };
  });
}

/** Remove one note from one task. Unknown ids are a no-op. */
export function withoutNote(tasks: Task[], taskId: string, noteId: string): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, notes: task.notes.filter((note) => note.id !== noteId) } : task,
  );
}
