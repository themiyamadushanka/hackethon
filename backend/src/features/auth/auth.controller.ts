import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthValidator } from './auth.validator';
import { ApiResponseBuilder } from '../../common/utils/api-response';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = AuthValidator.validateLogin(req.body);
      const result = await authService.login(dto);
      return ApiResponseBuilder.success(res, result, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = AuthValidator.validateRegister(req.body);
      const result = await authService.register(dto);
      return ApiResponseBuilder.success(res, result, 'Registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
