import { MigrationInterface, QueryRunner } from 'typeorm';

export class CfdiTaxesyConcepts1752259645099 implements MigrationInterface {
  name = 'CfdiTaxesyConcepts1752259645099';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`reset_passwords\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(64) NOT NULL, \`expiresAt\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NULL, UNIQUE INDEX \`IDX_facfa65cec881e1d583b35eb61\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cfdi_taxes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` enum ('TRASLADADO', 'RETENIDO') NOT NULL, \`impuesto\` varchar(5) NOT NULL, \`tipo_factor\` varchar(5) NOT NULL, \`tasa_cuota\` decimal(12,6) NULL, \`importe\` decimal(15,6) NOT NULL, \`base\` decimal(15,6) NOT NULL, \`conceptId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cfdi_concepts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`clave_prodserv\` varchar(25) NOT NULL, \`no_identificacion\` varchar(100) NULL, \`cantidad\` decimal(15,6) NOT NULL, \`valor_unitario\` decimal(15,6) NOT NULL, \`descuento\` decimal(15,6) NOT NULL DEFAULT '0.000000', \`importe\` decimal(15,6) NOT NULL, \`descripcion\` varchar(1000) NOT NULL, \`cfdiHeaderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD CONSTRAINT \`FK_a7924305b82eb312a5da681c0f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_taxes\` ADD CONSTRAINT \`FK_b72e74c8ed9d62f28cfa1958b11\` FOREIGN KEY (\`conceptId\`) REFERENCES \`cfdi_concepts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_concepts\` ADD CONSTRAINT \`FK_4af1e45bee2d1acb749ae83f03b\` FOREIGN KEY (\`cfdiHeaderId\`) REFERENCES \`cfdi_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cfdi_concepts\` DROP FOREIGN KEY \`FK_4af1e45bee2d1acb749ae83f03b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_taxes\` DROP FOREIGN KEY \`FK_b72e74c8ed9d62f28cfa1958b11\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP FOREIGN KEY \`FK_a7924305b82eb312a5da681c0f4\``,
    );
    await queryRunner.query(`DROP TABLE \`cfdi_concepts\``);
    await queryRunner.query(`DROP TABLE \`cfdi_taxes\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_facfa65cec881e1d583b35eb61\` ON \`reset_passwords\``,
    );
    await queryRunner.query(`DROP TABLE \`reset_passwords\``);
  }
}
