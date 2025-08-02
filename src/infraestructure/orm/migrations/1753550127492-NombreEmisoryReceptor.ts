import { MigrationInterface, QueryRunner } from 'typeorm';

export class NombreEmisoryReceptor1753550127492 implements MigrationInterface {
  name = 'NombreEmisoryReceptor1753550127492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` ADD \`nombreEmisor\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` ADD \`nombreReceptor\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` DROP COLUMN \`nombreReceptor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` DROP COLUMN \`nombreEmisor\``,
    );
  }
}
