import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminUser1752500000000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // 1. Insertar el usuario admin
    await q.query(`
  INSERT IGNORE INTO users (id, fullName, email, username, passwordHash, provider, activo, created_at, updated_at)
  VALUES (
    1,
    'Administrador del Sistema',
    'admin@scrework.local',
    'admin',
    '$2b$10$TCvl1qG9sTXmoyXgfSRUDePQ9YfVd5CmzFDEzYgfUoJxrxnVDWtuO', -- admin12345
    'local',
    true,
    NOW(),
    NOW()
  );
`);

    // 2. Asignar rol 'admin' (id = 1)
    await q.query(`
      INSERT IGNORE INTO user_roles (user_id, role_id)
      VALUES (1, 1);
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DELETE FROM user_roles WHERE user_id = 1 AND role_id = 1`);
    await q.query(`DELETE FROM users WHERE id = 1`);
  }
}
