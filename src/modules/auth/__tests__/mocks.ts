// src/modules/auth/__tests__/mocks.ts
import { vi, Mocked } from 'vitest';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
import { TokenServicePort } from '@auth/application/ports/token-service.port';
import { Role } from '@auth/domain/entities/role.entity';

export const fakeRoleUser: Role = Object.assign(new Role(), {
  id: 2,
  name: 'user',
});

export const fakeUser = {
  id: 1,
  email: 'a@b.c',
  username: 'a',
  passwordHash: 'hash',
  activo: true,
};

export const mockRepo = (): Mocked<UserRepositoryPort> => ({
  existsByEmail: vi.fn(),
  existsByUsername: vi.fn(),
  findByLogin: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
});

export const mockHash = (): Mocked<HashServicePort> => ({
  hash: vi.fn(),
  compare: vi.fn(),
});

export const mockJwt = () =>
  ({
    sign: vi.fn().mockReturnValue('access'),
    signRefresh: vi.fn().mockReturnValue('refresh'),
    verifyRefresh: vi.fn(),
    verify: vi.fn(),
  }) satisfies TokenServicePort;

export const mockRoleRepo = () => ({
  findByName: vi.fn().mockResolvedValue(fakeRoleUser),
});
