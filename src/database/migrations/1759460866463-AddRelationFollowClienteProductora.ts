import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationFollowClienteProductora1759460866463
  implements MigrationInterface
{
  name = 'AddRelationFollowClienteProductora1759460866463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`clientes_productoras_seguidas\` (\`cliente_id\` int NOT NULL, \`productora_id\` int NOT NULL, INDEX \`IDX_7048516e64083122a91f120b64\` (\`cliente_id\`), INDEX \`IDX_ac3061a6a631007c35e1a3659e\` (\`productora_id\`), PRIMARY KEY (\`cliente_id\`, \`productora_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clientes_productoras_seguidas\` ADD CONSTRAINT \`FK_7048516e64083122a91f120b646\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clientes_productoras_seguidas\` ADD CONSTRAINT \`FK_ac3061a6a631007c35e1a3659ef\` FOREIGN KEY (\`productora_id\`) REFERENCES \`productora\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`clientes_productoras_seguidas\` DROP FOREIGN KEY \`FK_ac3061a6a631007c35e1a3659ef\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`clientes_productoras_seguidas\` DROP FOREIGN KEY \`FK_7048516e64083122a91f120b646\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ac3061a6a631007c35e1a3659e\` ON \`clientes_productoras_seguidas\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7048516e64083122a91f120b64\` ON \`clientes_productoras_seguidas\``,
    );
    await queryRunner.query(`DROP TABLE \`clientes_productoras_seguidas\``);
  }
}
