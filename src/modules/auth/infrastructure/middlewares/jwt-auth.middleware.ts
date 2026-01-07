// src/modules/auth/infraestructure/middlewares/jwt-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { container } from '@shared/container';
import { TokenServicePort } from '@auth/application/ports/token-service.port';
import { ApiError } from '@shared/error/ApiError';
import { AccessTokenPayload } from '@auth/domain/types/access-token-payload.type';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';

export function jwtAuth() {
  const tokenSvc = container.resolve<TokenServicePort>('TokenServicePort');
  const userRepo = container.resolve<UserRepositoryPort>('UserRepo');

  return async (req: Request, _res: Response, next: NextFunction) => {
    const raw = req.headers.authorization?.split(' ')[1];
    if (!raw) return next(new ApiError(401, 'MISSING_ACCESS_TOKEN'));

    try {
      const payload = tokenSvc.verify<AccessTokenPayload>(raw);

      if (!payload.sub || !payload.accountId) {
        // payload inválido o token viejo sin accountId
        return next(new ApiError(401, 'INVALID_ACCESS_TOKEN'));
      }

      req.userId = payload.sub;
      req.accountId = payload.accountId;
      req.userRoles = payload.roles ?? [];

      const user = await userRepo.findById(payload.sub);
      if (!user) return next(new ApiError(401, 'INVALID_ACCESS_TOKEN'));
      if (!user.emailVerified)
        return next(new ApiError(403, 'EMAIL_NOT_VERIFIED'));

      next();
    } catch {
      return next(new ApiError(401, 'INVALID_ACCESS_TOKEN'));
    }
  };
}
