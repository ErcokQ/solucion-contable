// src/modules/auth/infraestructure/middlewares/jwt-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { container } from '@shared/container';
import { TokenServicePort } from '@auth/application/ports/token-service.port';
import { ApiError } from '@shared/error/ApiError'; // tu clase centralizada

export function jwtAuth() {
  const tokenSvc = container.resolve<TokenServicePort>('TokenService');

  return (req: Request, _res: Response, next: NextFunction) => {
    const raw = req.headers.authorization?.split(' ')[1];
    if (!raw) return next(new ApiError(401, 'MISSING_ACCESS_TOKEN'));

    try {
      const payload = tokenSvc.verify<{ sub: number }>(raw);
      req.userId = payload.sub;
      next();
    } catch {
      return next(new ApiError(401, 'INVALID_ACCESS_TOKEN'));
    }
  };
}
