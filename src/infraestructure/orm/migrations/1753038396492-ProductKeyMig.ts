import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductKeyMig1753038396492 implements MigrationInterface {
  name = 'ProductKeyMig1753038396492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`product_keys\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(64) NOT NULL, \`used\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_70c8ad918995a54d9b2db32e58\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_70c8ad918995a54d9b2db32e58\` ON \`product_keys\``,
    );
    await queryRunner.query(`DROP TABLE \`product_keys\``);
  }
}
