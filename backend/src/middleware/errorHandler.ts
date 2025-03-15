import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: unknown;
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction // Prefix with underscore to indicate it's intentionally unused
) => {
  let statusCode = 500;
  const response: ErrorResponse = {
    status: 'error',
    message: 'Internal server error',
  };

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    response.message = 'Validation error';
    response.code = 'VALIDATION_ERROR';
    response.details = err.errors;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: err,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    });
  } else {
    logger.warn('Client error:', {
      error: err,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json(response);
}; 