import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavoritosRelation1760999378318
  implements MigrationInterface
{
  name = 'CreateFavoritosRelation1760999378318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`clientes_eventos_favoritos\` (\`cliente_id\` int NOT NULL, \`evento_id\` int NOT NULL, INDEX \`IDX_32e10855976a30df08473a66e8\` (\`cliente_id\`), INDEX \`IDX_8dd6f597f31bcde68a864cd8ac\` (\`evento_id\`), PRIMARY KEY (\`cliente_id\`, \`evento_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clientes_eventos_favoritos\` ADD CONSTRAINT \`FK_32e10855976a30df08473a66e8d\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clientes_eventos_favoritos\` ADD CONSTRAINT \`FK_8dd6f597f31bcde68a864cd8ac2\` FOREIGN KEY (\`evento_id\`) REFERENCES \`evento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`clientes_eventos_favoritos\` DROP FOREIGN KEY \`FK_8dd6f597f31bcde68a864cd8ac2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`clientes_eventos_favoritos\` DROP FOREIGN KEY \`FK_32e10855976a30df08473a66e8d\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_8dd6f597f31bcde68a864cd8ac\` ON \`clientes_eventos_favoritos\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_32e10855976a30df08473a66e8\` ON \`clientes_eventos_favoritos\``,
    );
    await queryRunner.query(`DROP TABLE \`clientes_eventos_favoritos\``);
  }
}
