import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@shared/error/ApiError';

export function rolesGuard(...required: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const roles = req.userRoles ?? [];
    const ok = required.every((r) => roles.includes(r));
    if (!ok) return next(new ApiError(403, 'FORBIDDEN'));
    next();
  };
}
