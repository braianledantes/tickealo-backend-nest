import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelacionValidadorProductora1759013651180
  implements MigrationInterface
{
  name = 'AddRelacionValidadorProductora1759013651180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`productoras_validadores\` (\`productora_id\` int NOT NULL, \`validador_id\` int NOT NULL, INDEX \`IDX_ef330dd29b62b27d3e61c6f1b0\` (\`productora_id\`), INDEX \`IDX_bc5a31cf571745095f2142803e\` (\`validador_id\`), PRIMARY KEY (\`productora_id\`, \`validador_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`productoras_validadores\` ADD CONSTRAINT \`FK_ef330dd29b62b27d3e61c6f1b0e\` FOREIGN KEY (\`productora_id\`) REFERENCES \`productora\`(\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`productoras_validadores\` ADD CONSTRAINT \`FK_bc5a31cf571745095f2142803ea\` FOREIGN KEY (\`validador_id\`) REFERENCES \`validador\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`productoras_validadores\` DROP FOREIGN KEY \`FK_bc5a31cf571745095f2142803ea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`productoras_validadores\` DROP FOREIGN KEY \`FK_ef330dd29b62b27d3e61c6f1b0e\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bc5a31cf571745095f2142803e\` ON \`productoras_validadores\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ef330dd29b62b27d3e61c6f1b0\` ON \`productoras_validadores\``,
    );
    await queryRunner.query(`DROP TABLE \`productoras_validadores\``);
  }
}
