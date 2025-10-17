import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableEventoDescription1760720570951
  implements MigrationInterface
{
  name = 'AlterTableEventoDescription1760720570951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`evento\` DROP COLUMN \`descripcion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`evento\` ADD \`descripcion\` text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`evento\` DROP COLUMN \`descripcion\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`evento\` ADD \`descripcion\` varchar(255) NOT NULL`,
    );
  }
}
