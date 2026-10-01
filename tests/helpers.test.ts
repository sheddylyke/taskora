import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { Task } from '../src/types/index.ts';
import {
  FILTER_OPTIONS,
  PRIORITY_META,
  createId,
  formatDate,
  getStats,
  getVisibleTasks,
  matchesSearch,
  validateNote,
  validateTaskForm,
} from '../src/utils/helpers.ts';

const T0 = '2026-10-01T10:00:00.000Z';
const T1 = '2026-10-02T10:00:00.000Z';
const T2 = '2026-10-03T10:00:00.000Z';

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: `Task ${id}`,
    description: '',
    priority: 'medium',
    completed: false,
    createdAt: T0,
    updatedAt: T0,
    notes: [],
    ...overrides,
  };
}

const sample: Task[] = [
  task('1', { title: 'Buy milk', description: 'two liters', createdAt: T2 }),
  task('2', { title: 'Walk the dog', completed: true, createdAt: T1 }),
  task('3', { title: 'HNG stage 1', description: 'Submit Taskora', createdAt: T0 }),
];

describe('task summary statistics', () => {
  test('getStats returns total, active, and completed counts', () => {
    assert.deepEqual(getStats(sample), { total: 3, active: 2, completed: 1 });
  });

  test('getStats handles an empty list', () => {
    assert.deepEqual(getStats([]), { total: 0, active: 0, completed: 0 });
  });
});

describe('task filtering', () => {
  test('all filter keeps every task', () => {
    assert.equal(getVisibleTasks(sample, 'all', '').length, 3);
  });

  test('active filter excludes completed tasks', () => {
    const ids = getVisibleTasks(sample, 'active', '').map((t) => t.id);
    assert.deepEqual(ids, ['1', '3']);
  });

  test('completed filter keeps only completed tasks', () => {
    const ids = getVisibleTasks(sample, 'completed', '').map((t) => t.id);
    assert.deepEqual(ids, ['2']);
  });

  test('sorting puts completed tasks last, newest first among equals', () => {
    const ids = getVisibleTasks(sample, 'all', '').map((t) => t.id);
    assert.deepEqual(ids, ['1', '3', '2']);
  });

  test('does not mutate the input array', () => {
    const before = sample.map((t) => t.id).join(',');
    getVisibleTasks(sample, 'completed', 'zzz');
    assert.equal(
      sample.map((t) => t.id).join(','),
      before,
    );
  });

  test('filter options cover all, active, and completed', () => {
    assert.deepEqual(
      FILTER_OPTIONS.map((option) => option.id),
      ['all', 'active', 'completed'],
    );
  });
});

describe('task search', () => {
  test('matches title case-insensitively', () => {
    assert.equal(getVisibleTasks(sample, 'all', 'MILK').length, 1);
    assert.equal(getVisibleTasks(sample, 'all', 'milk')[0].id, '1');
  });

  test('matches description case-insensitively', () => {
    assert.equal(getVisibleTasks(sample, 'all', 'SUBMIT').length, 1);
    assert.equal(getVisibleTasks(sample, 'all', 'SUBMIT')[0].id, '3');
  });

  test('trims the query and returns everything for a blank query', () => {
    assert.equal(getVisibleTasks(sample, 'all', '   ').length, 3);
  });

  test('returns an empty list when nothing matches', () => {
    assert.deepEqual(getVisibleTasks(sample, 'all', 'zzz-nothing'), []);
  });

  test('search combines with filters', () => {
    assert.equal(getVisibleTasks(sample, 'active', 'milk').length, 1);
    assert.equal(getVisibleTasks(sample, 'completed', 'milk').length, 0);
  });

  test('matchesSearch checks title and description only', () => {
    assert.equal(matchesSearch(sample[0], 'buy'), true);
    assert.equal(matchesSearch(sample[0], 'liters'), true);
    assert.equal(matchesSearch(sample[0], 'dog'), false);
  });
});

describe('input validation', () => {
  test('rejects an empty or whitespace title', () => {
    assert.ok(validateTaskForm({ title: '', description: '', priority: 'low' }).title);
    assert.ok(validateTaskForm({ title: '   ', description: '', priority: 'low' }).title);
  });

  test('accepts a valid task draft', () => {
    assert.deepEqual(validateTaskForm({ title: '  Valid  ', description: 'ok', priority: 'high' }), {});
  });

  test('rejects a title over 100 characters', () => {
    assert.ok(validateTaskForm({ title: 'a'.repeat(101), description: '', priority: 'low' }).title);
    assert.equal(validateTaskForm({ title: 'a'.repeat(100), description: '', priority: 'low' }).title, undefined);
  });

  test('rejects a description over 500 characters', () => {
    assert.ok(
      validateTaskForm({ title: 'Ok', description: 'd'.repeat(501), priority: 'low' }).description,
    );
  });

  test('validateNote rejects empty/whitespace and oversized notes', () => {
    assert.ok(validateNote(''));
    assert.ok(validateNote('    '));
    assert.ok(validateNote('a'.repeat(501)));
  });

  test('validateNote accepts a real note', () => {
    assert.equal(validateNote('  remember this  '), null);
  });
});

describe('formatting and ids', () => {
  test('formatDate renders a readable date', () => {
    assert.match(formatDate(T0), /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });

  test('formatDate falls back for invalid input', () => {
    assert.equal(formatDate('not-a-date'), 'Unknown date');
  });

  test('createId returns unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    assert.equal(ids.size, 100);
  });

  test('priority metadata exists for every priority level', () => {
    assert.deepEqual(Object.keys(PRIORITY_META).sort(), ['high', 'low', 'medium']);
  });
});
