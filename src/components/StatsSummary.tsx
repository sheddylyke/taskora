import { CircleCheck, ClipboardList, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TaskStats } from '../types';

interface StatsSummaryProps {
  stats: TaskStats;
}

interface StatCard {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
}

/** Summary cards showing total, active, and completed task counts. */
export default function StatsSummary({ stats }: StatsSummaryProps) {
  const cards: StatCard[] = [
    {
      label: 'Total tasks',
      value: stats.total,
      icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
      accent: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: <Clock className="h-5 w-5" aria-hidden="true" />,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: <CircleCheck className="h-5 w-5" aria-hidden="true" />,
      accent: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <section aria-label="Task summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.accent}`}>
            {card.icon}
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums text-slate-900">{card.value}</p>
            <p className="truncate text-sm text-slate-500">{card.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
