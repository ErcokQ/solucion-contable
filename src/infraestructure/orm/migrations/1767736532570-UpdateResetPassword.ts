import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateResetPassword1767736532570 implements MigrationInterface {
  name = 'UpdateResetPassword1767736532570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_facfa65cec881e1d583b35eb61\` ON \`reset_passwords\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP COLUMN \`expiresAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP COLUMN \`token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD \`token_hash\` varchar(64) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD UNIQUE INDEX \`IDX_00f8aad8a25fc54456f4a5d5d7\` (\`token_hash\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD \`expires_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD \`used_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP FOREIGN KEY \`FK_a7924305b82eb312a5da681c0f4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` CHANGE \`user_id\` \`user_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD CONSTRAINT \`FK_a7924305b82eb312a5da681c0f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP FOREIGN KEY \`FK_a7924305b82eb312a5da681c0f4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` CHANGE \`user_id\` \`user_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD CONSTRAINT \`FK_a7924305b82eb312a5da681c0f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP COLUMN \`used_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP COLUMN \`expires_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP INDEX \`IDX_00f8aad8a25fc54456f4a5d5d7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` DROP COLUMN \`token_hash\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD \`token\` varchar(64) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reset_passwords\` ADD \`expiresAt\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_facfa65cec881e1d583b35eb61\` ON \`reset_passwords\` (\`token\`)`,
    );
  }
}
