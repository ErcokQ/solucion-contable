import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplacementCFDI1753729782410 implements MigrationInterface {
  name = 'ReplacementCFDI1753729782410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`cfdi_replacements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`uuidReemplazado\` char(36) NOT NULL, \`tipoRelacion\` varchar(2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`nuevoId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_replacements\` ADD CONSTRAINT \`FK_94de3a4e76a49a9a2d1c42e5c98\` FOREIGN KEY (\`nuevoId\`) REFERENCES \`cfdi_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_replacements\` DROP FOREIGN KEY \`FK_94de3a4e76a49a9a2d1c42e5c98\``,
    );
    await queryRunner.query(`DROP TABLE \`cfdi_replacements\``);
  }
}
