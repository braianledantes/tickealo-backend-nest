import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHistorialCreditosTable1763070325556
  implements MigrationInterface
{
  name = 'CreateHistorialCreditosTable1763070325556';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`historial_credito\` (\`id\` int NOT NULL AUTO_INCREMENT, \`payment_id\` varchar(255) NOT NULL, \`creditos\` int NOT NULL, \`precio\` decimal(10,2) NOT NULL, \`creditos_previos\` int NOT NULL, \`creditos_posterior\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`productoraUserId\` int NULL, UNIQUE INDEX \`IDX_1f9f1bc3cde7aec9275b42d2cd\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`historial_credito\` ADD CONSTRAINT \`FK_a48155f6ed65d31995e020887c1\` FOREIGN KEY (\`productoraUserId\`) REFERENCES \`productora\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`historial_credito\` DROP FOREIGN KEY \`FK_a48155f6ed65d31995e020887c1\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1f9f1bc3cde7aec9275b42d2cd\` ON \`historial_credito\``,
    );
    await queryRunner.query(`DROP TABLE \`historial_credito\``);
  }
}
