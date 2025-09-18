import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTypesOfUsersTables1758210011308
  implements MigrationInterface
{
  name = 'CreateTypesOfUsersTables1758210011308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`validador\` (\`user_id\` int NOT NULL, \`nombre\` varchar(255) NOT NULL, \`imagen_perfil_url\` varchar(255) NULL, PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`productora\` (\`user_id\` int NOT NULL, \`cuit\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`direccion\` varchar(255) NOT NULL, \`telefono\` varchar(255) NOT NULL, \`imagen_url\` varchar(255) NULL, \`creditos_disponibles\` int NOT NULL DEFAULT '0', \`calificacion\` float NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_e312283e16093e97d293dc6849\` (\`cuit\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cliente\` (\`user_id\` int NOT NULL, \`nombre\` varchar(255) NOT NULL, \`apellido\` varchar(255) NOT NULL, \`telefono\` varchar(255) NOT NULL, \`imagen_perfil_url\` varchar(255) NULL, \`puntos_acumulados\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`validador\` ADD CONSTRAINT \`FK_0d90ac38c56974c63d77d4f4791\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`productora\` ADD CONSTRAINT \`FK_b1cb2531fa5b49b3f74dab120ca\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cliente\` ADD CONSTRAINT \`FK_1abba09fd4376b65247f23a4a86\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cliente\` DROP FOREIGN KEY \`FK_1abba09fd4376b65247f23a4a86\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`productora\` DROP FOREIGN KEY \`FK_b1cb2531fa5b49b3f74dab120ca\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`validador\` DROP FOREIGN KEY \`FK_0d90ac38c56974c63d77d4f4791\``,
    );
    await queryRunner.query(`DROP TABLE \`cliente\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e312283e16093e97d293dc6849\` ON \`productora\``,
    );
    await queryRunner.query(`DROP TABLE \`productora\``);
    await queryRunner.query(`DROP TABLE \`validador\``);
  }
}
