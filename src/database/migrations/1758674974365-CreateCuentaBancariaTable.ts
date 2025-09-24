import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCuentaBancariaTable1758674974365
  implements MigrationInterface
{
  name = 'CreateCuentaBancariaTable1758674974365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`cuenta_bancaria\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre_titular\` varchar(255) NOT NULL, \`nombre_banco\` varchar(255) NOT NULL, \`alias\` varchar(255) NOT NULL, \`cbu\` varchar(255) NOT NULL, \`instrucciones\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`productora_id\` int NULL, UNIQUE INDEX \`REL_6202d9d74e96ca941ce03f87a4\` (\`productora_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cuenta_bancaria\` ADD CONSTRAINT \`FK_6202d9d74e96ca941ce03f87a45\` FOREIGN KEY (\`productora_id\`) REFERENCES \`productora\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cuenta_bancaria\` DROP FOREIGN KEY \`FK_6202d9d74e96ca941ce03f87a45\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_6202d9d74e96ca941ce03f87a4\` ON \`cuenta_bancaria\``,
    );
    await queryRunner.query(`DROP TABLE \`cuenta_bancaria\``);
  }
}
