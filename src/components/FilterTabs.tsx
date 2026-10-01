import type { TaskFilter, TaskStats } from '../types';
import { FILTER_OPTIONS } from '../utils/helpers';

interface FilterTabsProps {
  filter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  stats: TaskStats;
}

/** Segmented control for filtering tasks: All, Active, or Completed. */
export default function FilterTabs({ filter, onChange, stats }: FilterTabsProps) {
  const counts: Record<TaskFilter, number> = {
    all: stats.total,
    active: stats.active,
    completed: stats.completed,
  };

  return (
    <div
      className="inline-flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:w-auto"
      role="group"
      aria-label="Filter tasks"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = filter === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={isActive}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {option.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[option.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
