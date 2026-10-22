import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/app.error';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  // Token decoding placeholder (replace with jwt.verify in production)
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('Token not found');
  }

  // In production, decode JWT payload:
  req.user = {
    id: 'user_123',
    email: 'dev@example.com',
    role: 'developer',
  };

  next();
};
