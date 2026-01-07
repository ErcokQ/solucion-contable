// src/scripts/seed-roles.ts
import 'reflect-metadata';
import { AppDataSource } from '@infra/orm/data-source';
import { Role } from '@auth/domain/entities/role.entity';

async function seedRoles() {
  await AppDataSource.initialize();
  const roleRepo = AppDataSource.getRepository(Role);

  // 🔧 Definición centralizada de roles base
  const rolesToEnsure: Array<{ name: string }> = [
    { name: 'admin' }, // súper usuario de plataforma (ustedes)
    { name: 'account_owner' }, // dueño de una cuenta/tenant
    { name: 'account_user' }, // usuario “normal” de un tenant
    // en el futuro
    // { name: 'account_admin' },
    // { name: 'viewer' },
    // etc.
  ];

  for (const def of rolesToEnsure) {
    const existing = await roleRepo.findOne({ where: { name: def.name } });

    if (existing) {
      console.log(`ℹ️ Rol "${def.name}" ya existe (id=${existing.id})`);
      continue;
    }

    const role = roleRepo.create({
      name: def.name,
      // permissions: []  // si luego quieres asignar permisos por seed
    });

    await roleRepo.save(role);
    console.log(`✅ Rol "${def.name}" creado`);
  }

  console.log('✅ Seed de roles completado');
}

seedRoles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error en seed de roles', err);
    process.exit(1);
  });
