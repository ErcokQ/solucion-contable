import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTipoComprobanteCfdi1764444593149 implements MigrationInterface {
  name = 'AddTipoComprobanteCfdi1764444593149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` ADD \`tipo_comprobante\` varchar(1) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` DROP COLUMN \`tipo_comprobante\``,
    );
  }
}
