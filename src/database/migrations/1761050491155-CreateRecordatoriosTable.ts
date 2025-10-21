import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecordatoriosTable1761050491155
  implements MigrationInterface
{
  name = 'CreateRecordatoriosTable1761050491155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`recordatorio\` (\`id\` int NOT NULL AUTO_INCREMENT, \`days_before\` int NOT NULL, \`sent_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cliente_id\` int NULL, \`evento_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`recordatorio\` ADD CONSTRAINT \`FK_4f2d019ad71b5189d370a2095bd\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`recordatorio\` ADD CONSTRAINT \`FK_8f518bae87e64d953c6270f5965\` FOREIGN KEY (\`evento_id\`) REFERENCES \`evento\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`recordatorio\` DROP FOREIGN KEY \`FK_8f518bae87e64d953c6270f5965\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`recordatorio\` DROP FOREIGN KEY \`FK_4f2d019ad71b5189d370a2095bd\``,
    );
    await queryRunner.query(`DROP TABLE \`recordatorio\``);
  }
}
