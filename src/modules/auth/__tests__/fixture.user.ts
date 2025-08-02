import { User } from '@auth/domain/entities/user.entity';

/**
 * Devuelve un usuario completo con valores por defecto.
 * Puedes sobre-escribir los campos que quieras en cada test.
 */
export function makeFakeUser(overrides: Partial<User> = {}): User {
  const user = Object.assign(new User(), {
    id: 1,
    email: 'a@b.c',
    username: 'a',
    passwordHash: 'hash',
    fullName: 'Fake User',
    provider: 'local',
    avatar: null,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
    ...overrides, // permite cambiar solo lo necesario
  });

  return user;
}
