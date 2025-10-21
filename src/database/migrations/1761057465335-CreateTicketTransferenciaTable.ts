import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketTransferenciaTable1761057465335
  implements MigrationInterface
{
  name = 'CreateTicketTransferenciaTable1761057465335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`ticket_transferencia\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('pendiente', 'aceptada', 'rechazada') NOT NULL DEFAULT 'pendiente', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`clienteEmisorUserId\` int NULL, \`clienteReceptorUserId\` int NULL, \`ticketId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket_transferencia\` ADD CONSTRAINT \`FK_df40b34bf6a827eebe298e5c74e\` FOREIGN KEY (\`clienteEmisorUserId\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket_transferencia\` ADD CONSTRAINT \`FK_f344d2fa5efd008a7abe753a4c0\` FOREIGN KEY (\`clienteReceptorUserId\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket_transferencia\` ADD CONSTRAINT \`FK_c713870ee730b59591954e2ce25\` FOREIGN KEY (\`ticketId\`) REFERENCES \`ticket\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ticket_transferencia\` DROP FOREIGN KEY \`FK_c713870ee730b59591954e2ce25\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket_transferencia\` DROP FOREIGN KEY \`FK_f344d2fa5efd008a7abe753a4c0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket_transferencia\` DROP FOREIGN KEY \`FK_df40b34bf6a827eebe298e5c74e\``,
    );
    await queryRunner.query(`DROP TABLE \`ticket_transferencia\``);
  }
}
