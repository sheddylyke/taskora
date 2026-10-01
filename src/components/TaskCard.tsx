import { CalendarDays, Check, ChevronRight, Circle, FileText, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types';
import { PRIORITY_META, formatDate } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/** A single task card with priority, status, actions, and a details link. */
export default function TaskCard({ task, isSelected, onSelect, onToggle, onEdit, onDelete }: TaskCardProps) {
  const priority = PRIORITY_META[task.priority];

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all before:absolute before:inset-y-0 before:left-0 before:w-1 hover:-translate-y-0.5 hover:shadow-md ${priority.cardEdge} ${
        isSelected ? 'border-indigo-400 ring-2 ring-indigo-500/40' : 'border-slate-200/80'
      }`}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-start gap-3 pl-2">
        {/* Completion toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={task.completed}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as incomplete`
              : `Mark "${task.title}" as complete`
          }
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-transparent hover:border-indigo-500 hover:text-indigo-300'
          }`}
        >
          {task.completed ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Circle className="h-3 w-3" aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelect(task.id)}
              className={`min-w-0 rounded-md text-left text-sm font-semibold break-words hover:text-indigo-600 ${
                task.completed ? 'text-slate-500 line-through' : 'text-slate-900'
              }`}
              aria-label={`Open details for ${task.title}`}
            >
              {task.title}
            </button>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${priority.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} aria-hidden="true" />
              {priority.label}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(task.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {task.notes.length} note{task.notes.length === 1 ? '' : 's'}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                task.completed ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {task.completed ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 pl-2">
        <button
          type="button"
          onClick={() => onSelect(task.id)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
          aria-label={`Open notes and details for ${task.title}`}
        >
          Notes &amp; details
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            aria-label={`Edit task: ${task.title}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label={`Delete task: ${task.title}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
