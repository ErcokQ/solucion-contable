import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtTokenService } from '@auth/infrastructure/services/jwt-token.service';

process.env.JWT_SECRET = 'testsecret_32_chars_minimum_123456';
process.env.JWT_REFRESH_SECRET = 'testsecret_refresh_32_chars_5678';

describe('JwtTokenService', () => {
  let svc: JwtTokenService;

  beforeEach(() => {
    svc = new JwtTokenService();
  });

  it('debería firmar y verificar el payload', () => {
    const token = svc.sign({ sub: 42 });
    const payload = svc.verify<{ sub: number }>(token);
    expect(payload.sub).toBe(42);
  });

  it('debería lanzar error con token alterado', () => {
    const malo = svc.sign({ sub: 1 }) + 'a';
    expect(() => svc.verify(malo)).toThrow();
  });

  it('el refresh token usa otra clave (verify debe fallar)', () => {
    const refresh = svc.signRefresh({ sub: 7 });
    expect(() => svc.verify(refresh)).toThrow();
  });

  it('el token expira según lo configurado', () => {
    vi.useFakeTimers();
    const corto = svc.sign({ sub: 9 }, { expiresIn: '1s' });

    vi.advanceTimersByTime(1100); // 1,1 s
    expect(() => svc.verify(corto)).toThrow('jwt expired');

    vi.useRealTimers();
  });
});
