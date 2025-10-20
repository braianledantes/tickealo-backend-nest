import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComentariosTable1760993808731 implements MigrationInterface {
  name = 'CreateComentariosTable1760993808731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`comentario\` (\`id\` int NOT NULL AUTO_INCREMENT, \`evento_id\` int NOT NULL, \`calificacion\` int NOT NULL DEFAULT '0', \`comentario\` text NOT NULL, \`fijado\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cliente_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_8979bf2b204613a886ac5aa993a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` CHANGE \`entrada_id\` \`entrada_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_8979bf2b204613a886ac5aa993a\` FOREIGN KEY (\`entrada_id\`) REFERENCES \`entrada\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comentario\` ADD CONSTRAINT \`FK_7ce1294e2064187373e66261942\` FOREIGN KEY (\`evento_id\`) REFERENCES \`evento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comentario\` ADD CONSTRAINT \`FK_92294c201fbcbc85db7bf0a7654\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`comentario\` DROP FOREIGN KEY \`FK_92294c201fbcbc85db7bf0a7654\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comentario\` DROP FOREIGN KEY \`FK_7ce1294e2064187373e66261942\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_8979bf2b204613a886ac5aa993a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` CHANGE \`entrada_id\` \`entrada_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_8979bf2b204613a886ac5aa993a\` FOREIGN KEY (\`entrada_id\`) REFERENCES \`entrada\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE \`comentario\``);
  }
}
