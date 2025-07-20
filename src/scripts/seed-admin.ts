import 'reflect-metadata';
import { AppDataSource } from '@infra/orm/data-source';
import { container } from '@shared/container';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { RoleRepositoryPort } from '@auth/application/ports/role-repository.port';
import { HashServicePort } from '@auth/application/ports/hash-service.port';
import { User } from '@auth/domain/entities/user.entity';

async function seedAdminUser() {
  await AppDataSource.initialize();

  const users = container.resolve<UserRepositoryPort>('UserRepo');
  const roles = container.resolve<RoleRepositoryPort>('RoleRepo');
  const hashSvc = container.resolve<HashServicePort>('HashServicePort');

  const exists = await users.existsByUsername('admin');
  if (exists) {
    console.log('✅ Usuario admin ya existe');
    return;
  }

  const pwd = await hashSvc.hash('admin12345');
  const user = User.create(
    'Administrador del Sistema',
    'admin@scrework.local',
    'admin',
    pwd,
  );

  const role = await roles.findByName('admin');
  if (!role) throw new Error('Rol admin no encontrado en base de datos');

  user.roles = [role];
  await users.save(user);

  console.log('✅ Usuario admin creado con éxito');
}

seedAdminUser().then(() => process.exit(0));
