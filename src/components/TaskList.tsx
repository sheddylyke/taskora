import type { ReactNode } from 'react';
import type { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelect: (taskId: string) => void;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Rendered when `tasks` is empty (context-specific empty state). */
  emptyState: ReactNode;
}

/** Responsive grid of task cards with an empty state fallback. */
export default function TaskList({
  tasks,
  selectedTaskId,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  emptyState,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <div>{emptyState}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isSelected={task.id === selectedTaskId}
          onSelect={onSelect}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
