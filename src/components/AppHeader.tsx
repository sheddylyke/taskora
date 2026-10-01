import { Menu, Plus } from 'lucide-react';

interface AppHeaderProps {
  taskCount: number;
  activeCount: number;
  onOpenMenu: () => void;
  onAddTask: () => void;
}

/** Top bar with the page title, mobile menu trigger, and the Add Task button. */
export default function AppHeader({ taskCount, activeCount, onOpenMenu, onAddTask }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
          aria-controls="taskora-sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            My Tasks
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            {taskCount === 0
              ? 'Add your first task to get started'
              : `${activeCount} active task${activeCount === 1 ? '' : 's'} waiting for you`}
          </p>
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition-colors hover:bg-indigo-500 active:bg-indigo-700 sm:px-4"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sr-only sm:hidden">Add Task</span>
        </button>
      </div>
    </header>
  );
}
