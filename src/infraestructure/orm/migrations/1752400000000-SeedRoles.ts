import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles1752400000000 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      INSERT IGNORE INTO roles (id, name, created_at, updated_at) VALUES
        (1, 'admin', NOW(), NOW()),
        (2, 'user',  NOW(), NOW());
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DELETE FROM roles WHERE id IN (1,2);`);
  }
}
