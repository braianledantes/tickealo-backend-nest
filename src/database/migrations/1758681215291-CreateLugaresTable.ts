import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLugaresTable1758681215291 implements MigrationInterface {
  name = 'CreateLugaresTable1758681215291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`lugar\` (\`id\` int NOT NULL AUTO_INCREMENT, \`latitud\` decimal(11,8) NOT NULL, \`longitud\` decimal(11,8) NOT NULL, \`direccion\` varchar(255) NOT NULL, \`ciudad\` varchar(255) NOT NULL, \`provincia\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4f77cf7c30a236f7c187b993e5\` (\`latitud\`), UNIQUE INDEX \`IDX_a4442ac9e6fd36043f79b38655\` (\`longitud\`), UNIQUE INDEX \`IDX_7f1ef13c13a1a22e714dd7c0a6\` (\`direccion\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_7f1ef13c13a1a22e714dd7c0a6\` ON \`lugar\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a4442ac9e6fd36043f79b38655\` ON \`lugar\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4f77cf7c30a236f7c187b993e5\` ON \`lugar\``,
    );
    await queryRunner.query(`DROP TABLE \`lugar\``);
  }
}
