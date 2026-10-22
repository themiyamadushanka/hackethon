import { Response } from 'express';
import { ApiResponse, PaginationMeta } from 'shared';

export class ApiResponseBuilder {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    const responsePayload: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(responsePayload);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message?: string,
    statusCode = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static error(res: Response, message: string, statusCode = 500, details?: unknown): Response {
    const responsePayload: ApiResponse = {
      success: false,
      message,
      error: {
        code: `ERR_${statusCode}`,
        details,
      },
    };
    return res.status(statusCode).json(responsePayload);
  }
}
