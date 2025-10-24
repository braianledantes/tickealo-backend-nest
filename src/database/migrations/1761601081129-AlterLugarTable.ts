import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLugarTable1761601081129 implements MigrationInterface {
  name = 'AlterLugarTable1761601081129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lugar\` ADD \`pais\` varchar(255) NOT NULL DEFAULT 'Argentina'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`lugar\` ADD \`iso_codigo_pais\` varchar(2) NOT NULL DEFAULT 'AR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lugar\` DROP COLUMN \`iso_codigo_pais\``,
    );
    await queryRunner.query(`ALTER TABLE \`lugar\` DROP COLUMN \`pais\``);
  }
}
