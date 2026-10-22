import { apiClient } from '@/lib/api-client';
import { Task, CreateTaskDto, UpdateTaskDto, API_ROUTES } from 'shared';

export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    return apiClient<Task[]>(API_ROUTES.TASKS.ROOT);
  },

  getTaskById: async (id: string): Promise<Task> => {
    return apiClient<Task>(`${API_ROUTES.TASKS.ROOT}/${id}`);
  },

  createTask: async (dto: CreateTaskDto): Promise<Task> => {
    return apiClient<Task>(API_ROUTES.TASKS.ROOT, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  updateTask: async (id: string, dto: UpdateTaskDto): Promise<Task> => {
    return apiClient<Task>(`${API_ROUTES.TASKS.ROOT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    return apiClient<void>(`${API_ROUTES.TASKS.ROOT}/${id}`, {
      method: 'DELETE',
    });
  },
};
