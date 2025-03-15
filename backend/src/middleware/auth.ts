import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

interface JwtPayload {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Not authorized to access this route', 401));
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
  next();
};

export const createAuthMiddleware = (roles: UserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // First check authentication
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      // Then check role authorization
      if (!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }

      next();
    } catch (error) {
      next(new AppError('Authentication failed', 401));
    }
  };
}; 