import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComplementosNomina1752555339696 implements MigrationInterface {
  name = 'ComplementosNomina1752555339696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payroll_deductions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipoDeduccion\` varchar(15) NOT NULL, \`clave\` varchar(15) NOT NULL, \`concepto\` varchar(255) NOT NULL, \`importe\` decimal(15,2) NOT NULL, \`payrollHeaderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payroll_other_payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipoOtroPago\` varchar(15) NOT NULL, \`clave\` varchar(15) NOT NULL, \`concepto\` varchar(255) NOT NULL, \`importe\` decimal(15,2) NOT NULL, \`payrollHeaderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payroll_incapacities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipoIncapacidad\` varchar(15) NOT NULL, \`diasIncapacidad\` int NOT NULL, \`importe\` decimal(15,2) NOT NULL, \`payrollHeaderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payroll_headers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipoNomina\` varchar(1) NOT NULL, \`fechaPago\` date NOT NULL, \`fechaInicialPago\` date NOT NULL, \`fechaFinalPago\` date NOT NULL, \`diasPagados\` int NOT NULL, \`totalPercepciones\` decimal(15,2) NOT NULL, \`totalDeducciones\` decimal(15,2) NOT NULL, \`totalOtrosPagos\` decimal(15,2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`cfdiHeaderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payroll_perceptions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipoPercepcion\` varchar(16) NOT NULL, \`clave\` varchar(15) NOT NULL, \`concepto\` varchar(255) NOT NULL, \`importeGravado\` decimal(15,2) NOT NULL, \`importeExento\` decimal(15,2) NOT NULL, \`payrollHeaderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_deductions\` ADD CONSTRAINT \`FK_e694f9c57f6fd0cb9424208e0ec\` FOREIGN KEY (\`payrollHeaderId\`) REFERENCES \`payroll_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_other_payments\` ADD CONSTRAINT \`FK_ae3a8b6c1bfd9fba37a0b36b313\` FOREIGN KEY (\`payrollHeaderId\`) REFERENCES \`payroll_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_incapacities\` ADD CONSTRAINT \`FK_edc5edc9860190c7e5b6512cc6e\` FOREIGN KEY (\`payrollHeaderId\`) REFERENCES \`payroll_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_headers\` ADD CONSTRAINT \`FK_c57b58c11fd430bd8628a78cecd\` FOREIGN KEY (\`cfdiHeaderId\`) REFERENCES \`cfdi_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_perceptions\` ADD CONSTRAINT \`FK_5e5beb342817436db3264e265ad\` FOREIGN KEY (\`payrollHeaderId\`) REFERENCES \`payroll_headers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payroll_perceptions\` DROP FOREIGN KEY \`FK_5e5beb342817436db3264e265ad\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_headers\` DROP FOREIGN KEY \`FK_c57b58c11fd430bd8628a78cecd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_incapacities\` DROP FOREIGN KEY \`FK_edc5edc9860190c7e5b6512cc6e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_other_payments\` DROP FOREIGN KEY \`FK_ae3a8b6c1bfd9fba37a0b36b313\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payroll_deductions\` DROP FOREIGN KEY \`FK_e694f9c57f6fd0cb9424208e0ec\``,
    );
    await queryRunner.query(`DROP TABLE \`payroll_perceptions\``);
    await queryRunner.query(`DROP TABLE \`payroll_headers\``);
    await queryRunner.query(`DROP TABLE \`payroll_incapacities\``);
    await queryRunner.query(`DROP TABLE \`payroll_other_payments\``);
    await queryRunner.query(`DROP TABLE \`payroll_deductions\``);
  }
}
