import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEntradaAndEventoTables1760027220677
  implements MigrationInterface
{
  name = 'UpdateEntradaAndEventoTables1760027220677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`evento\` ADD \`stock_entradas\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`entrada\` ADD \`stock\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`entrada\` DROP COLUMN \`stock\``);
    await queryRunner.query(
      `ALTER TABLE \`evento\` DROP COLUMN \`stock_entradas\``,
    );
  }
}
