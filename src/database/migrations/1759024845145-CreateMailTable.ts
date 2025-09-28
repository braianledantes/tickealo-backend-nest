import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMailTable1759024845145 implements MigrationInterface {
  name = 'CreateMailTable1759024845145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`mail\` (\`id\` varchar(36) NOT NULL, \`to\` varchar(255) NOT NULL, \`from\` varchar(255) NOT NULL, \`subject\` varchar(255) NOT NULL, \`text\` text NULL, \`html\` text NULL, \`status\` enum ('sent', 'failed', 'pending') NOT NULL DEFAULT 'pending', \`error_message\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`mail\``);
  }
}
