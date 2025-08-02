import { MigrationInterface, QueryRunner } from 'typeorm';

export class CfdiHeaderStatus1752191776899 implements MigrationInterface {
  name = 'CfdiHeaderStatus1752191776899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` ADD \`status\` enum ('PENDING', 'PROCESSING', 'PARSED', 'ERROR') NOT NULL DEFAULT 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` DROP COLUMN \`status\``,
    );
  }
}
