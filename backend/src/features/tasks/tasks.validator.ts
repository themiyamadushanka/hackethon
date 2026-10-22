import { BadRequestError } from '../../common/errors/app.error';
import { CreateTaskDto, UpdateTaskDto } from 'shared';

export class TaskValidator {
  static validateCreate(body: unknown): CreateTaskDto {
    const data = body as CreateTaskDto;
    if (!data.title || !data.description) {
      throw new BadRequestError('Task title and description are required');
    }
    return data;
  }

  static validateUpdate(body: unknown): UpdateTaskDto {
    const data = body as UpdateTaskDto;
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestError('At least one field must be provided for update');
    }
    return data;
  }
}
