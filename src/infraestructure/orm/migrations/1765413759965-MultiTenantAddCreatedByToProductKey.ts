import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiTenantAddCreatedByToProductKey1765413759965
  implements MigrationInterface
{
  name = 'MultiTenantAddCreatedByToProductKey1765413759965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` ADD \`created_by_user_id\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` DROP COLUMN \`created_by_user_id\``,
    );
  }
}
