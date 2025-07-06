import * as jwt from 'jsonwebtoken';
import { TokenServicePort } from '@auth/application/ports/token-service.port';
import { config } from '@shared/config';

export class JwtTokenService implements TokenServicePort {
  private readonly accessSecret = config.JWT_SECRET;
  private readonly refreshSecret = config.JWT_REFRESH_SECRET;

  sign(payload: object, opts: jwt.SignOptions = {}): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: '15m', ...opts });
  }

  verify<T = unknown>(token: string): T {
    return jwt.verify(token, this.accessSecret) as T;
  }

  signRefresh(payload: object, opts: jwt.SignOptions = {}) {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d', ...opts });
  }
}
