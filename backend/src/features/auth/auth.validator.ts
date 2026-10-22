import { BadRequestError } from '../../common/errors/app.error';
import { LoginRequestDto, RegisterRequestDto } from 'shared';

export class AuthValidator {
  static validateLogin(body: unknown): LoginRequestDto {
    const data = body as LoginRequestDto;
    if (!data.email || !data.password) {
      throw new BadRequestError('Email and password are required');
    }
    return data;
  }

  static validateRegister(body: unknown): RegisterRequestDto {
    const data = body as RegisterRequestDto;
    if (!data.email || !data.name || !data.password) {
      throw new BadRequestError('Name, email, and password are required');
    }
    return data;
  }
}
