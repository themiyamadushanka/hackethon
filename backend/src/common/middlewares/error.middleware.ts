import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';
import { ApiResponseBuilder } from '../utils/api-response';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return ApiResponseBuilder.error(res, err.message, err.statusCode, err.details);
  }

  // Unhandled internal server errors
  console.error('[Unhandled Error]:', err);
  return ApiResponseBuilder.error(res, 'Internal Server Error', 500);
};
