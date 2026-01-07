import 'reflect-metadata';
import { AppDataSource } from '@infra/orm/data-source';
import { container } from '@shared/container';

import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { RoleRepositoryPort } from '@auth/application/ports/role-repository.port';
import { HashServicePort } from '@auth/application/ports/hash-service.port';

import { User } from '@auth/domain/entities/user.entity';

import { Account } from '@account/domain/entities/account.entity';
import { UserAccount } from '@account/domain/entities/user-account.entity';

async function seedAdminUser() {
  await AppDataSource.initialize();

  const users = container.resolve<UserRepositoryPort>('UserRepo');
  const roles = container.resolve<RoleRepositoryPort>('RoleRepo');
  const hashSvc = container.resolve<HashServicePort>('HashServicePort');

  const accountRepo = AppDataSource.getRepository(Account);
  const userAccountRepo = AppDataSource.getRepository(UserAccount);

  // 1) Asegurar usuario admin
  let user = await users.findByLogin('admin');

  if (!user) {
    const pwd = await hashSvc.hash('admin12345');
    user = User.create(
      'Administrador del Sistema',
      'admin@scrework.local',
      'admin',
      pwd,
    );
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();

    const role = await roles.findByName('admin');
    if (!role) throw new Error('Rol admin no encontrado en base de datos');

    user.roles = [role];
    await users.save(user);

    console.log('✅ Usuario admin creado con éxito');
  } else {
    console.log('ℹ️ Usuario admin ya existía');
  }

  // 2) ¿Ya tiene alguna asociación user_account?
  const existingUserAccount = await userAccountRepo.findOne({
    where: { userId: user.id },
    relations: ['account'],
  });

  if (existingUserAccount) {
    console.log(
      `✅ Usuario admin ya está asociado al account "${existingUserAccount.account.name}"`,
    );
    return;
  }

  // 3) Crear/obtener un Account interno para el sistema
  let account = await accountRepo.findOne({
    where: { name: 'SC Admin Account' },
  });

  if (!account) {
    account = accountRepo.create({
      name: 'SC Admin Account',
      plan: 'internal', // 👈 opcional: marcarlo distinto
      maxUsers: 10,
      maxCompanies: 0, // 👈 NO necesitamos companies aquí
      active: true,
    });

    await accountRepo.save(account);
    console.log('✅ Account "SC Admin Account" creado');
  } else {
    console.log('ℹ️ Account "SC Admin Account" ya existía');
  }

  // 4) Asociar admin ↔ account en user_accounts
  const adminRole = await roles.findByName('admin');
  if (!adminRole) throw new Error('Rol admin no encontrado en base de datos');

  const userAccount = userAccountRepo.create({
    userId: user.id,
    accountId: account.id,
    roleId: adminRole.id,
    isOwner: true,
  });

  await userAccountRepo.save(userAccount);

  console.log(
    `✅ Usuario admin asociado al account interno "${account.name}" como owner`,
  );
}

seedAdminUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
