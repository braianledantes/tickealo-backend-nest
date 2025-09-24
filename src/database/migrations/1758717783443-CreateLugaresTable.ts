import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLugaresTable1758717783443 implements MigrationInterface {
  name = 'CreateLugaresTable1758717783443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`lugar\` (\`id\` int NOT NULL AUTO_INCREMENT, \`latitud\` decimal(17,14) NOT NULL, \`longitud\` decimal(17,14) NOT NULL, \`direccion\` varchar(255) NOT NULL, \`ciudad\` varchar(255) NOT NULL, \`provincia\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`lugar\``);
  }
}
