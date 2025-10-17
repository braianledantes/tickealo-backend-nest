import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTicketTable1760706856723 implements MigrationInterface {
  name = 'AlterTicketTable1760706856723';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_d4bbb20043602e8c9a4f2aee188\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` CHANGE \`validated_by_id\` \`validated_by\` int NULL`,
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
      `ALTER TABLE \`ticket\` CHANGE \`validated_by\` \`validated_by_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_d4bbb20043602e8c9a4f2aee188\` FOREIGN KEY (\`validated_by_id\`) REFERENCES \`validador\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
