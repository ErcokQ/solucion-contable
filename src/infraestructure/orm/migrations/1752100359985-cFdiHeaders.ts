import { MigrationInterface, QueryRunner } from 'typeorm';

export class CFdiHeaders1752100359985 implements MigrationInterface {
  name = 'CFdiHeaders1752100359985';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`cfdi_headers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` char(36) NOT NULL, \`rfcEmisor\` varchar(13) NOT NULL, \`rfcReceptor\` varchar(13) NOT NULL, \`serie\` varchar(20) NULL, \`folio\` varchar(20) NULL, \`fecha\` date NOT NULL, \`subTotal\` decimal(15,2) NOT NULL, \`descuento\` decimal(15,2) NOT NULL DEFAULT '0.00', \`total\` decimal(15,2) NOT NULL, \`moneda\` varchar(3) NOT NULL, \`tipoCambio\` decimal(12,6) NULL, \`formaPago\` varchar(20) NULL, \`metodoPago\` varchar(20) NULL, \`lugarExpedicion\` varchar(5) NULL, \`xmlPath\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`IDX_337b8570a6bef544934cee36e1\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` ADD CONSTRAINT \`FK_44f409527666dab77f41bf42057\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` DROP FOREIGN KEY \`FK_44f409527666dab77f41bf42057\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_337b8570a6bef544934cee36e1\` ON \`cfdi_headers\``,
    );
    await queryRunner.query(`DROP TABLE \`cfdi_headers\``);
  }
}
