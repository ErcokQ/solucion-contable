import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailVerificacionUpdate1767742681425
  implements MigrationInterface
{
  name = 'EmailVerificacionUpdate1767742681425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`email_verification_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`token_hash\` varchar(64) NOT NULL, \`expires_at\` datetime NOT NULL, \`used_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c20ed35f3d31d486aabcd0564d\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`email_verified\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`email_verified_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`email_verification_tokens\` ADD CONSTRAINT \`FK_fdcb77f72f529bf65c95d72a147\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`email_verification_tokens\` DROP FOREIGN KEY \`FK_fdcb77f72f529bf65c95d72a147\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`email_verified_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`email_verified\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c20ed35f3d31d486aabcd0564d\` ON \`email_verification_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`email_verification_tokens\``);
  }
}
