import { Task, CreateTaskDto, UpdateTaskDto } from 'shared';
import { taskRepository, TaskRepository } from './tasks.repository';
import { NotFoundError } from '../../common/errors/app.error';

export class TaskService {
  constructor(private readonly repo: TaskRepository = taskRepository) {}

  async listTasks(): Promise<Task[]> {
    return this.repo.findAll();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.repo.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with id '${id}' not found`);
    }
    return task;
  }

  async createTask(dto: CreateTaskDto, createdBy: string): Promise<Task> {
    return this.repo.create(dto, createdBy);
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Task with id '${id}' not found`);
    }
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Task with id '${id}' not found`);
    }
  }
}

export const taskService = new TaskService();
