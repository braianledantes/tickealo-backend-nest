import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTicketValidadorTable1760716264302
  implements MigrationInterface
{
  name = 'AlterTicketValidadorTable1760716264302';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD \`validated_by\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_2d2efd39aaf3b9c27f4a5f66956\` FOREIGN KEY (\`validated_by\`) REFERENCES \`validador\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_2d2efd39aaf3b9c27f4a5f66956\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP COLUMN \`validated_by\``,
    );
  }
}
