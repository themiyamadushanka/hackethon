'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskDto, UpdateTaskDto } from 'shared';
import { tasksApi } from '../api/tasks.api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (dto: CreateTaskDto) => {
    try {
      const newTask = await tasksApi.createTask(dto);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, dto: UpdateTaskDto) => {
    try {
      const updated = await tasksApi.updateTask(id, dto);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
}
