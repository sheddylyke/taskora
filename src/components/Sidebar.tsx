import { Clock, CircleCheck, Inbox, X } from 'lucide-react';
import type { TaskFilter, TaskStats } from '../types';
import { FILTER_OPTIONS } from '../utils/helpers';

interface SidebarProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  stats: TaskStats;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ICONS: Record<TaskFilter, typeof Inbox> = {
  all: Inbox,
  active: Clock,
  completed: CircleCheck,
};

/**
 * Taskora navigation sidebar.
 * Collapses into an off-canvas drawer on mobile and stays fixed on desktop.
 */
export default function Sidebar({ filter, onFilterChange, stats, isOpen, onClose }: SidebarProps) {
  const counts: Record<TaskFilter, number> = {
    all: stats.total,
    active: stats.active,
    completed: stats.completed,
  };
  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="taskora-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-slate-200 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Taskora navigation"
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
              <CircleCheck className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-tight text-white">Taskora</p>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">To-Do &amp; Notes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 scrollbar-thin">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tasks
          </p>
          {FILTER_OPTIONS.map((option) => {
            const Icon = NAV_ICONS[option.id];
            const isActive = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange(option.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-left">{option.label} tasks</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive ? 'bg-white/15 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {counts[option.id]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Progress summary */}
        <div className="m-3 rounded-2xl bg-slate-900 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Progress
            </p>
            <p className="text-sm font-bold text-white">{progress}%</p>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Task completion progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {stats.completed} of {stats.total} task{stats.total === 1 ? '' : 's'} completed
          </p>
        </div>

        <p className="px-5 pb-4 text-[11px] leading-relaxed text-slate-400">
          HNG Internship 15 &middot; Stage 1
        </p>
      </aside>
    </>
  );
}
