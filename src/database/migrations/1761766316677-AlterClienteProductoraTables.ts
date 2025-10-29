import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterClienteProductoraTables1761766316677
  implements MigrationInterface
{
  name = 'AlterClienteProductoraTables1761766316677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`productora\` ADD \`pais\` varchar(255) NOT NULL DEFAULT 'Argentina'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cliente\` ADD \`pais\` varchar(255) NOT NULL DEFAULT 'Argentina'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`cliente\` DROP COLUMN \`pais\``);
    await queryRunner.query(`ALTER TABLE \`productora\` DROP COLUMN \`pais\``);
  }
}
