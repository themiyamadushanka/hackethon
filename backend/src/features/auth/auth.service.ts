import { AuthResponseData, LoginRequestDto, RegisterRequestDto } from 'shared';

export class AuthService {
  async login(dto: LoginRequestDto): Promise<AuthResponseData> {
    return {
      user: {
        id: 'usr_1',
        name: 'Demo Developer',
        email: dto.email,
        role: 'developer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'jwt_mock_token_xyz',
    };
  }

  async register(dto: RegisterRequestDto): Promise<AuthResponseData> {
    return {
      user: {
        id: `usr_${Date.now()}`,
        name: dto.name,
        email: dto.email,
        role: dto.role || 'developer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'jwt_mock_token_new_user',
    };
  }
}

export const authService = new AuthService();
