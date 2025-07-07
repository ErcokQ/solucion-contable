import 'reflect-metadata';
import { SignInUseCase } from '@auth/application/use-cases/signIn.usecase';
import { ApiError } from '@shared/error/ApiError';
import { mockRepo, mockHash, mockJwt } from './mocks';
import { makeFakeUser } from './fixture.user';

describe('SigninUseCase', () => {
  const repo = mockRepo();
  const hash = mockHash();
  const jwt = mockJwt();
  const uc = new SignInUseCase(repo, hash, jwt);

  it('devuelve tokens con credenciales válidas', async () => {
    repo.findByLogin.mockResolvedValue(makeFakeUser());
    hash.compare.mockResolvedValue(true);

    const out = await uc.execute({ login: 'a', password: 'ok' });
    expect(out.accessToken).toBe('access');
  });

  it('INVALID_CREDENTIALS cuando la contraseña falla', async () => {
    repo.findByLogin.mockResolvedValue(makeFakeUser());
    hash.compare.mockResolvedValue(false);

    await expect(uc.execute({ login: 'a', password: 'bad' })).rejects.toEqual(
      new ApiError(401, 'INVALID_CREDENTIALS'),
    );
  });
});
