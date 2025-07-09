// src/modules/auth/application/use-cases/refresh.usecase.ts
import { injectable, inject } from 'tsyringe';

import { RefreshDto } from '../dto/refresh.dto';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { TokenServicePort } from '../ports/token-service.port';
import * as jwt from 'jsonwebtoken';
import { ApiError } from '@shared/error/ApiError';

@injectable()
export class RefreshUseCase {
  constructor(
    @inject('UserRepo') private readonly users: UserRepositoryPort,
    @inject('TokenServicePort') private readonly jwt: TokenServicePort,
  ) {}

  async execute(dto: RefreshDto) {
    /* 1. Verificar el refresh token */
    let payload: { sub: number };
    try {
      payload = this.jwt.verifyRefresh<{ sub: number }>(dto.refreshToken);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'REFRESH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'INVALID_REFRESH_TOKEN');
      }
      throw error;
    }

    /* 2. Comprobar que el usuario siga activo */
    const user = await this.users.findById(payload.sub);
    if (!user || !user.activo) throw new ApiError(403, 'USER_DISABLED');

    /* 3. Emitir nuevos tokens (rotación) */
    const accessToken = this.jwt.sign({ sub: user.id });
    const refreshToken = this.jwt.signRefresh({ sub: user.id });

    return { accessToken, refreshToken };
  }
}
