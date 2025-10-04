import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComprasTickets1759607852614 implements MigrationInterface {
  name = 'ComprasTickets1759607852614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo_alfanumerico\` varchar(7) NOT NULL, \`estado\` enum ('COMPRA_PENDIENTE', 'COMPRA_CANCELADO', 'PENDIENTE_VALIDACION', 'VALIDADO') NOT NULL DEFAULT 'COMPRA_PENDIENTE', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cliente_id\` int NULL, \`entrada_id\` int NULL, \`compra_id\` int NULL, UNIQUE INDEX \`IDX_31d83a0858155addd5e1693de5\` (\`codigo_alfanumerico\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`compra\` (\`id\` int NOT NULL AUTO_INCREMENT, \`estado\` enum ('PENDIENTE', 'COMPLETADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE', \`comprobante_transferencia\` varchar(255) NOT NULL, \`monto\` decimal(10,2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cliente_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_07596daecf4cb562b27a18c5489\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_8979bf2b204613a886ac5aa993a\` FOREIGN KEY (\`entrada_id\`) REFERENCES \`entrada\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_86eceab129c5b4a9bcfdac01863\` FOREIGN KEY (\`compra_id\`) REFERENCES \`compra\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compra\` ADD CONSTRAINT \`FK_0f4f6195d6bc7c65a15d24277b3\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`compra\` DROP FOREIGN KEY \`FK_0f4f6195d6bc7c65a15d24277b3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_86eceab129c5b4a9bcfdac01863\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_8979bf2b204613a886ac5aa993a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_07596daecf4cb562b27a18c5489\``,
    );
    await queryRunner.query(`DROP TABLE \`compra\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_31d83a0858155addd5e1693de5\` ON \`ticket\``,
    );
    await queryRunner.query(`DROP TABLE \`ticket\``);
  }
}
