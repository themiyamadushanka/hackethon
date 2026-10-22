import { Request, Response, NextFunction } from 'express';
import { taskService } from './tasks.service';
import { TaskValidator } from './tasks.validator';
import { ApiResponseBuilder } from '../../common/utils/api-response';

export class TaskController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.listTasks();
      return ApiResponseBuilder.success(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      return ApiResponseBuilder.success(res, task);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = TaskValidator.validateCreate(req.body);
      const createdBy = (req as any).user?.id || 'anonymous_user';
      const created = await taskService.createTask(dto, createdBy);
      return ApiResponseBuilder.success(res, created, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = TaskValidator.validateUpdate(req.body);
      const updated = await taskService.updateTask(req.params.id, dto);
      return ApiResponseBuilder.success(res, updated, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.deleteTask(req.params.id);
      return ApiResponseBuilder.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
