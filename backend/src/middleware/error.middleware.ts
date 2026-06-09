import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/utils/logger';
import { ApiResponse } from '../shared/types';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.path}`, 404));
}

export function globalErrorHandler(
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const isOperational = 'isOperational' in err ? err.isOperational : false;

  if (!isOperational || statusCode >= 500) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  const response: ApiResponse = {
    success: false,
    message: isOperational ? err.message : 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    ...('errors' in err && err.errors && { errors: err.errors }),
  };

  res.status(statusCode).json(response);
}

export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
