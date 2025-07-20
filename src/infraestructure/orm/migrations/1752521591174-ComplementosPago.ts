import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComplementosPago1752521591174 implements MigrationInterface {
  name = 'ComplementosPago1752521591174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payment_headers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fechaPago\` date NOT NULL, \`monto\` decimal(15,2) NOT NULL, \`formaPago\` varchar(2) NOT NULL, \`moneda\` varchar(3) NOT NULL DEFAULT 'MXN', \`tipoCambio\` decimal(12,6) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`cfdiHeaderId\` int NULL, INDEX \`IDX_09c5f771d2a3f72e39d951466f\` (\`fechaPago\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payment_details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`uuidRelacionado\` char(36) NOT NULL, \`importePagado\` decimal(15,2) NOT NULL, \`saldoAnterior\` decimal(15,2) NOT NULL, \`saldoInsoluto\` decimal(15,2) NOT NULL, \`paymentHeaderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_headers\` ADD CONSTRAINT \`FK_f2726aaa00141078a1c5a168d7b\` FOREIGN KEY (\`cfdiHeaderId\`) REFERENCES \`cfdi_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_details\` ADD CONSTRAINT \`FK_e1499031b0a62f0c3d8346e8dd3\` FOREIGN KEY (\`paymentHeaderId\`) REFERENCES \`payment_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_details\` DROP FOREIGN KEY \`FK_e1499031b0a62f0c3d8346e8dd3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_headers\` DROP FOREIGN KEY \`FK_f2726aaa00141078a1c5a168d7b\``,
    );
    await queryRunner.query(`DROP TABLE \`payment_details\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_09c5f771d2a3f72e39d951466f\` ON \`payment_headers\``,
    );
    await queryRunner.query(`DROP TABLE \`payment_headers\``);
  }
}
