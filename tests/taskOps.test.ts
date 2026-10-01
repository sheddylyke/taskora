import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { Task, TaskDraft } from '../src/types/index.ts';
import {
  buildTask,
  withAddedNote,
  withToggledTask,
  withoutNote,
  withoutTask,
  withUpdatedNote,
  withUpdatedTask,
} from '../src/utils/taskOps.ts';

const T0 = '2026-10-01T10:00:00.000Z';
const T1 = '2026-10-02T10:00:00.000Z';

function draft(partial: Partial<TaskDraft> = {}): TaskDraft {
  return { title: 'Sample task', description: 'Some details', priority: 'medium', ...partial };
}

function makeTask(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: `Task ${id}`,
    description: '',
    priority: 'low',
    completed: false,
    createdAt: T0,
    updatedAt: T0,
    notes: [],
    ...overrides,
  };
}

describe('task creation', () => {
  test('buildTask creates a valid active task and trims input', () => {
    const task = buildTask(draft({ title: '  Buy milk  ', description: '  2 liters  ' }), T1);
    assert.equal(task.title, 'Buy milk');
    assert.equal(task.description, '2 liters');
    assert.equal(task.completed, false);
    assert.equal(task.priority, 'medium');
    assert.deepEqual(task.notes, []);
    assert.equal(task.createdAt, T1);
    assert.equal(task.updatedAt, T1);
    assert.ok(task.id.length > 0);
  });

  test('buildTask generates unique ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => buildTask(draft()).id));
    assert.equal(ids.size, 50);
  });

  test('buildTask preserves the chosen priority', () => {
    for (const priority of ['low', 'medium', 'high'] as const) {
      assert.equal(buildTask(draft({ priority }), T0).priority, priority);
    }
  });
});

describe('task editing and deletion', () => {
  test('withUpdatedTask updates editable fields and bumps updatedAt', () => {
    const tasks = [makeTask('a'), makeTask('b')];
    const next = withUpdatedTask(tasks, 'a', draft({ title: ' Renamed ', priority: 'high' }), T1);
    assert.equal(next[0].title, 'Renamed');
    assert.equal(next[0].priority, 'high');
    assert.equal(next[0].updatedAt, T1);
    assert.equal(next[1].title, 'Task b');
  });

  test('withUpdatedTask leaves the original list untouched (immutable)', () => {
    const tasks = [makeTask('a')];
    const snapshot = JSON.parse(JSON.stringify(tasks));
    withUpdatedTask(tasks, 'a', draft({ title: 'Changed' }), T1);
    assert.deepEqual(tasks, snapshot);
  });

  test('withUpdatedTask is a no-op for unknown ids', () => {
    const tasks = [makeTask('a')];
    const next = withUpdatedTask(tasks, 'missing', draft({ title: 'Nope' }), T1);
    assert.deepEqual(next, tasks);
  });

  test('withoutTask removes only the target task', () => {
    const tasks = [makeTask('a'), makeTask('b'), makeTask('c')];
    const next = withoutTask(tasks, 'b');
    assert.deepEqual(
      next.map((task) => task.id),
      ['a', 'c'],
    );
    assert.equal(tasks.length, 3);
  });

  test('withoutTask is a no-op for unknown ids', () => {
    const tasks = [makeTask('a')];
    assert.equal(withoutTask(tasks, 'missing').length, 1);
  });
});

describe('task completion', () => {
  test('withToggledTask flips completed both ways and bumps updatedAt', () => {
    let tasks = [makeTask('a')];
    tasks = withToggledTask(tasks, 'a', T1);
    assert.equal(tasks[0].completed, true);
    assert.equal(tasks[0].updatedAt, T1);
    tasks = withToggledTask(tasks, 'a', T1);
    assert.equal(tasks[0].completed, false);
  });

  test('withToggledTask is a no-op for unknown ids', () => {
    const tasks = [makeTask('a', { completed: false })];
    assert.equal(withToggledTask(tasks, 'missing')[0].completed, false);
  });
});

describe('notes management', () => {
  const base = [
    makeTask('a', {
      notes: [
        { id: 'n1', content: 'Existing note', createdAt: T0, updatedAt: T0 },
      ],
    }),
    makeTask('b'),
  ];

  test('withAddedNote trims content, prepends, and bumps the task updatedAt', () => {
    const next = withAddedNote(base, 'a', '  New note  ', T1);
    assert.equal(next[0].notes.length, 2);
    assert.equal(next[0].notes[0].content, 'New note');
    assert.equal(next[0].notes[0].createdAt, T1);
    assert.equal(next[0].updatedAt, T1);
    assert.equal(next[1].notes.length, 0);
    assert.equal(base[0].notes.length, 1); // original untouched
  });

  test('withUpdatedNote edits content, keeps createdAt, bumps updatedAt', () => {
    const next = withUpdatedNote(base, 'a', 'n1', '  Edited  ', T1);
    assert.equal(next[0].notes[0].content, 'Edited');
    assert.equal(next[0].notes[0].createdAt, T0);
    assert.equal(next[0].notes[0].updatedAt, T1);
    assert.equal(base[0].notes[0].content, 'Existing note');
  });

  test('withUpdatedNote is a no-op for unknown note ids', () => {
    const next = withUpdatedNote(base, 'a', 'missing', 'Changed', T1);
    assert.equal(next[0].notes[0].content, 'Existing note');
  });

  test('withoutNote removes only the target note on the target task', () => {
    const tasks = withAddedNote(base, 'a', 'Second note', T1);
    const next = withoutNote(tasks, 'a', tasks[0].notes[0].id);
    assert.equal(next[0].notes.length, 1);
    assert.equal(next[0].notes[0].id, 'n1');
    assert.equal(next[1].notes.length, 0);
  });
});
