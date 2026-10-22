export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'manager';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequestDto {
  email: string;
  password?: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password?: string;
  role?: 'admin' | 'developer' | 'manager';
}

export interface AuthResponseData {
  user: User;
  token: string;
}
