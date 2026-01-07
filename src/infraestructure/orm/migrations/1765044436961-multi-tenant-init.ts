import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiTenantInit1765044436961 implements MigrationInterface {
  name = 'MultiTenantInit1765044436961';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`companies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`account_id\` int NOT NULL, \`name\` varchar(200) NOT NULL, \`rfc\` varchar(13) NOT NULL, \`tax_regime\` varchar(5) NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(150) NOT NULL, \`plan\` varchar(50) NOT NULL DEFAULT 'single', \`max_users\` int NOT NULL DEFAULT '3', \`max_companies\` int NOT NULL DEFAULT '1', \`active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`account_id\` int NOT NULL, \`role_id\` int NOT NULL, \`is_owner\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` ADD \`tipo_comprobante\` varchar(1) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` ADD \`type\` varchar(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` ADD \`account_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` ADD \`max_uses\` int NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` ADD \`used_count\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` ADD \`expires_at\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`companies\` ADD CONSTRAINT \`FK_59caaf4ca872d0014267d036627\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_accounts\` ADD CONSTRAINT \`FK_6711686e2dc4fcf9c7c83b83735\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_accounts\` ADD CONSTRAINT \`FK_6163d54dc1cb367fc0361128bcd\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_accounts\` ADD CONSTRAINT \`FK_d17e21f468588fd08e977a020fa\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` ADD CONSTRAINT \`FK_6cf3526759cecd56564f691e17d\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` DROP FOREIGN KEY \`FK_6cf3526759cecd56564f691e17d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_accounts\` DROP FOREIGN KEY \`FK_d17e21f468588fd08e977a020fa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_accounts\` DROP FOREIGN KEY \`FK_6163d54dc1cb367fc0361128bcd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_accounts\` DROP FOREIGN KEY \`FK_6711686e2dc4fcf9c7c83b83735\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`companies\` DROP FOREIGN KEY \`FK_59caaf4ca872d0014267d036627\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` DROP COLUMN \`expires_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` DROP COLUMN \`used_count\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` DROP COLUMN \`max_uses\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` DROP COLUMN \`account_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_keys\` DROP COLUMN \`type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cfdi_headers\` DROP COLUMN \`tipo_comprobante\``,
    );
    await queryRunner.query(`DROP TABLE \`user_accounts\``);
    await queryRunner.query(`DROP TABLE \`accounts\``);
    await queryRunner.query(`DROP TABLE \`companies\``);
  }
}
