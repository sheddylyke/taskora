import { useMemo, useState } from 'react';
import { ClipboardList, SearchX } from 'lucide-react';
import AppHeader from './components/AppHeader';
import ConfirmDialog from './components/ConfirmDialog';
import EmptyState from './components/EmptyState';
import FilterTabs from './components/FilterTabs';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import StatsSummary from './components/StatsSummary';
import TaskDetailsPanel from './components/TaskDetailsPanel';
import TaskFormModal from './components/TaskFormModal';
import TaskList from './components/TaskList';
import { useTasks } from './hooks/useTasks';
import type { Note, Task, TaskDraft, TaskFilter } from './types';
import { getStats, getVisibleTasks } from './utils/helpers';

/**
 * Taskora - a modern to-do list and notes app.
 * All state lives here; UI pieces are reusable components under ./components.
 */
export default function App() {
  const { tasks, storageError, addTask, updateTask, deleteTask, toggleTask, addNote, updateNote, deleteNote } =
    useTasks();

  // UI state
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<{ task: Task; note: Note } | null>(null);

  // Derived state
  const stats = useMemo(() => getStats(tasks), [tasks]);
  const visibleTasks = useMemo(
    () => getVisibleTasks(tasks, filter, searchQuery),
    [tasks, filter, searchQuery],
  );
  const selectedTask = selectedTaskId
    ? (tasks.find((task) => task.id === selectedTaskId) ?? null)
    : null;
  const hasActiveFilters = searchQuery.trim().length > 0 || filter !== 'all';

  // Task form
  function openCreateTask() {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  function handleSubmitTask(draft: TaskDraft) {
    if (editingTask) {
      updateTask(editingTask.id, draft);
    } else {
      addTask(draft);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  }

  // Deletion
  function confirmDeleteTask() {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    if (selectedTaskId === taskToDelete.id) setSelectedTaskId(null);
    setTaskToDelete(null);
  }

  function confirmDeleteNote() {
    if (!noteToDelete) return;
    deleteNote(noteToDelete.task.id, noteToDelete.note.id);
    setNoteToDelete(null);
  }

  // Empty states
  const emptyState =
    tasks.length === 0 ? (
      <EmptyState
        icon={<ClipboardList className="h-7 w-7" aria-hidden="true" />}
        title="No tasks yet"
        message="Create your first task and start organizing your day with Taskora."
        action={{ label: 'Add your first task', onClick: openCreateTask }}
      />
    ) : (
      <EmptyState
        icon={<SearchX className="h-7 w-7" aria-hidden="true" />}
        title="No tasks found"
        message={
          filter === 'completed' && searchQuery.trim()
            ? 'No completed tasks match your search.'
            : filter === 'active' && searchQuery.trim()
              ? 'No active tasks match your search.'
              : filter === 'completed'
                ? 'You have not completed any tasks yet.'
                : filter === 'active'
                  ? 'All caught up - every task is completed!'
                  : 'No tasks match your search. Try a different keyword.'
        }
        action={
          hasActiveFilters ? { label: 'Clear search & filters', onClick: clearFilters } : undefined
        }
      />
    );

  function clearFilters() {
    setSearchQuery('');
    setFilter('all');
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        filter={filter}
        onFilterChange={(next) => {
          setFilter(next);
          setSidebarOpen(false);
        }}
        stats={stats}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <AppHeader
          taskCount={stats.total}
          activeCount={stats.active}
          onOpenMenu={() => setSidebarOpen(true)}
          onAddTask={openCreateTask}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {storageError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <span className="font-semibold">Storage warning:</span>
              <span>{storageError} Changes may be lost when you refresh.</span>
            </div>
          )}

          <StatsSummary stats={stats} />

          {/* Toolbar: search + filters */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <FilterTabs filter={filter} onChange={setFilter} stats={stats} />
          </div>

          <p aria-live="polite" className="sr-only">
            Showing {visibleTasks.length} of {stats.total} tasks.
          </p>

          {/* Task grid */}
          <div className="mt-5">
            <TaskList
              tasks={visibleTasks}
              selectedTaskId={selectedTaskId}
              onSelect={setSelectedTaskId}
              onToggle={toggleTask}
              onEdit={openEditTask}
              onDelete={setTaskToDelete}
              emptyState={emptyState}
            />
          </div>
        </main>
      </div>

      {/* Task details & notes drawer */}
      {selectedTask && (
        <TaskDetailsPanel
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onToggle={toggleTask}
          onEdit={openEditTask}
          onDelete={setTaskToDelete}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={(task, note) => setNoteToDelete({ task, note })}
        />
      )}

      {/* Create / edit task dialog */}
      {isFormOpen && (
        <TaskFormModal
          key={editingTask?.id ?? 'new-task'}
          task={editingTask}
          onSubmit={handleSubmitTask}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Destructive confirmations */}
      {taskToDelete && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${taskToDelete.title}" and its notes will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete task"
          onConfirm={confirmDeleteTask}
          onCancel={() => setTaskToDelete(null)}
        />
      )}

      {noteToDelete && (
        <ConfirmDialog
          title="Delete this note?"
          message="This note will be permanently removed from the task."
          confirmLabel="Delete note"
          onConfirm={confirmDeleteNote}
          onCancel={() => setNoteToDelete(null)}
        />
      )}
    </div>
  );
}
