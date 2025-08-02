import 'reflect-metadata';
import * as jwtLib from 'jsonwebtoken'; // ← añade
import { RefreshUseCase } from '@auth/application/use-cases/refresh.usecase';
import { ApiError } from '@shared/error/ApiError';
import { mockRepo, mockJwt } from './mocks';
import { makeFakeUser } from './fixture.user';

describe('RefreshUseCase', () => {
  const repo = mockRepo();
  const jwt = mockJwt();
  const uc = new RefreshUseCase(repo, jwt);

  it('devuelve nuevos tokens con refresh válido', async () => {
    jwt.verifyRefresh.mockReturnValue({ sub: 1 });
    repo.findById.mockResolvedValue(makeFakeUser());

    const out = await uc.execute({ refreshToken: 'rt' });
    expect(out.refreshToken).toBe('refresh');
  });

  it('REFRESH_TOKEN_EXPIRED cuando caducó', async () => {
    // Usa la clase TokenExpiredError real
    const expired = new jwtLib.TokenExpiredError('jwt expired', new Date());

    jwt.verifyRefresh.mockImplementationOnce(() => {
      throw expired;
    });

    await expect(uc.execute({ refreshToken: 'rt' })).rejects.toEqual(
      new ApiError(401, 'REFRESH_TOKEN_EXPIRED'),
    );
  });
});
