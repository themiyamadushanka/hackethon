import React from 'react';
import { Task, TaskPriority, TaskStatus } from 'shared';
import { Card, Badge, Button } from '@/components/ui';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onDelete?: (id: string) => void;
}

const priorityBadges: Record<TaskPriority, 'default' | 'info' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
  return (
    <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
          {task.title}
        </h3>
        <Badge label={task.priority} variant={priorityBadges[task.priority]} />
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <span className="text-xs font-mono text-zinc-500 uppercase">
          Status: {task.status.replace('_', ' ')}
        </span>

        <div className="flex items-center gap-2">
          {task.status !== 'done' && onStatusChange && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(task.id, 'done')}
            >
              Mark Done
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
