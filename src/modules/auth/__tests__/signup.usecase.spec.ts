import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { SignupUseCase } from '@auth/application/use-cases/signup.usecase';
import { ApiError } from '@shared/error/ApiError';
import { mockRepo, mockHash, mockJwt, mockRoleRepo } from './mocks';

describe('SignupUseCase', () => {
  const repo = mockRepo();
  const hash = mockHash();
  const jwt = mockJwt();
  const rol = mockRoleRepo();
  const uc = new SignupUseCase(repo, rol, hash, jwt);

  it('crea usuario y devuelve tokens', async () => {
    repo.existsByEmail.mockResolvedValue(false);
    repo.existsByUsername.mockResolvedValue(false);
    hash.hash.mockResolvedValue('HASH');

    repo.save.mockImplementation((u) => {
      u.id = 1;
      return Promise.resolve();
    });
    await uc.execute({
      fullName: 'F',
      email: 'e@x.com',
      username: 'u',
      password: '123456789012',
    });

    expect(repo.save).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalledWith({
      sub: expect.any(Number),
      roles: ['user'],
    });
  });

  it('lanza EMAIL_ALREADY_EXISTS', async () => {
    repo.existsByEmail.mockResolvedValue(true);

    await expect(
      uc.execute({
        fullName: 'F',
        email: 'e@x.com',
        username: 'u',
        password: '123456789012',
      }),
    ).rejects.toEqual(new ApiError(409, 'EMAIL_ALREADY_EXISTS'));
  });
});
