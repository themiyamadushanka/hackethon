'use client';

import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui';

export const TaskList: React.FC = () => {
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addTask({
      title: newTitle,
      description: newDesc || 'No description provided',
      priority: 'medium',
    });

    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Quick Task Creation Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Create New Task
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Task Title (e.g. Implement OAuth)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Short Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            + Add Task
          </Button>
        </div>
      </form>

      {/* Task Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Project Tasks ({tasks.length})
          </h2>
          {loading && <span className="text-xs text-zinc-500">Syncing with backend...</span>}
        </div>

        {error && (
          <div className="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
            Backend notice: {error} (Ensure backend server is running on port 5000)
          </div>
        )}

        {tasks.length === 0 && !loading ? (
          <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-500 text-sm">
            No tasks found. Create your first task above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(id, status) => updateTask(id, { status })}
                onDelete={(id) => deleteTask(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
