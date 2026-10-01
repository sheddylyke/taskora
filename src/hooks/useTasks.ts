import { useCallback } from 'react';
import type { Task, TaskDraft } from '../types';
import {
  buildTask,
  withAddedNote,
  withToggledTask,
  withoutNote,
  withoutTask,
  withUpdatedNote,
  withUpdatedTask,
} from '../utils/taskOps';
import { STORAGE_KEYS, sanitizeTasks } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

/**
 * All application logic for tasks and their notes, separated from the UI.
 * The actual state transitions live in utils/taskOps (unit-tested); this hook
 * only wires them to localStorage-backed state.
 */
export function useTasks() {
  const [tasks, setTasks, storageError] = useLocalStorage<Task[]>(
    STORAGE_KEYS.tasks,
    [],
    sanitizeTasks,
  );

  /** Create a new task. Returns the created task's id. */
  const addTask = useCallback(
    (draft: TaskDraft): string => {
      const task = buildTask(draft);
      setTasks((prev) => [task, ...prev]);
      return task.id;
    },
    [setTasks],
  );

  /** Update the editable fields of an existing task. */
  const updateTask = useCallback(
    (id: string, draft: TaskDraft) => {
      setTasks((prev) => withUpdatedTask(prev, id, draft));
    },
    [setTasks],
  );

  /** Delete a task and everything attached to it. */
  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => withoutTask(prev, id));
    },
    [setTasks],
  );

  /** Toggle a task between completed and active. */
  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) => withToggledTask(prev, id));
    },
    [setTasks],
  );

  /** Attach a note to a task. */
  const addNote = useCallback(
    (taskId: string, content: string) => {
      setTasks((prev) => withAddedNote(prev, taskId, content));
    },
    [setTasks],
  );

  /** Edit an existing note. */
  const updateNote = useCallback(
    (taskId: string, noteId: string, content: string) => {
      setTasks((prev) => withUpdatedNote(prev, taskId, noteId, content));
    },
    [setTasks],
  );

  /** Delete a note from a task. */
  const deleteNote = useCallback(
    (taskId: string, noteId: string) => {
      setTasks((prev) => withoutNote(prev, taskId, noteId));
    },
    [setTasks],
  );

  return {
    tasks,
    storageError,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addNote,
    updateNote,
    deleteNote,
  };
}
