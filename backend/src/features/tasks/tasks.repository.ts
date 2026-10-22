import { Task, CreateTaskDto, UpdateTaskDto } from 'shared';

// In-memory repository (swap with Prisma, Drizzle, or Mongoose easily)
export class TaskRepository {
  private tasks: Map<string, Task> = new Map([
    [
      'task_1',
      {
        id: 'task_1',
        title: 'Setup Monorepo Architecture',
        description: 'Establish clear boundaries between frontend, backend, and shared code',
        status: 'done',
        priority: 'high',
        assignedTo: 'usr_1',
        createdBy: 'usr_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async create(dto: CreateTaskDto, createdBy: string): Promise<Task> {
    const id = `task_${Date.now()}`;
    const newTask: Task = {
      id,
      title: dto.title,
      description: dto.description,
      status: 'todo',
      priority: dto.priority || 'medium',
      assignedTo: dto.assignedTo,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task | null> {
    const existing = this.tasks.get(id);
    if (!existing) return null;

    const updated: Task = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

export const taskRepository = new TaskRepository();
