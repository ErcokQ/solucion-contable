// src/shared/middlewares/require-role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@shared/error/ApiError';

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRoles = req.userRoles ?? [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return next(new ApiError(403, 'ACCESS_DENIED'));
    }
    next();
  };
}
