import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCompraYTicketTables1760318840732
  implements MigrationInterface
{
  name = 'AlterCompraYTicketTables1760318840732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`compra\` CHANGE \`comprobante_transferencia\` \`comprobante_transferencia\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` CHANGE \`estado\` \`estado\` enum ('COMPRA_CANCELADO', 'INICIADO', 'COMPRA_PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO') NOT NULL DEFAULT 'INICIADO'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compra\` CHANGE \`estado\` \`estado\` enum ('CANCELADA', 'COMPLETADA', 'INICIADA', 'PENDIENTE', 'ACEPTADA', 'RECHAZADA') NOT NULL DEFAULT 'INICIADA'`,
    );

    await queryRunner.query(
      'UPDATE ticket SET estado = "RECHAZADO" WHERE estado = "COMPRA_CANCELADO"',
    );

    await queryRunner.query(
      'UPDATE compra SET estado = "ACEPTADA" WHERE estado = "COMPLETADA"',
    );
    await queryRunner.query(
      'UPDATE compra SET estado = "RECHAZADA" WHERE estado = "CANCELADA"',
    );

    await queryRunner.query(
      `ALTER TABLE \`ticket\` CHANGE \`estado\` \`estado\` enum ('INICIADO', 'COMPRA_PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO') NOT NULL DEFAULT 'INICIADO'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compra\` CHANGE \`estado\` \`estado\` enum ('INICIADA', 'PENDIENTE', 'ACEPTADA', 'RECHAZADA') NOT NULL DEFAULT 'INICIADA'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ticket\` CHANGE \`estado\` \`estado\` enum ('COMPRA_CANCELADO', 'INICIADO', 'COMPRA_PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO') NOT NULL DEFAULT 'INICIADO'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`compra\` CHANGE \`estado\` \`estado\` enum ('CANCELADA', 'COMPLETADA', 'INICIADA', 'PENDIENTE', 'ACEPTADA', 'RECHAZADA') NOT NULL DEFAULT 'INICIADA'`,
    );

    await queryRunner.query(
      'UPDATE ticket SET estado = "COMPRA_CANCELADO" WHERE estado = "RECHAZADO"',
    );

    await queryRunner.query(
      'UPDATE compra SET estado = "COMPLETADA" WHERE estado = "ACEPTADA"',
    );
    await queryRunner.query(
      'UPDATE compra SET estado = "CANCELADA" WHERE estado = "RECHAZADA"',
    );

    await queryRunner.query(
      `ALTER TABLE \`compra\` CHANGE \`estado\` \`estado\` enum ('PENDIENTE', 'COMPLETADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ticket\` CHANGE \`estado\` \`estado\` enum ('COMPRA_PENDIENTE', 'COMPRA_CANCELADO', 'PENDIENTE_VALIDACION', 'VALIDADO') NOT NULL DEFAULT 'COMPRA_PENDIENTE'`,
    );

    await queryRunner.query(
      `ALTER TABLE \`compra\` CHANGE \`comprobante_transferencia\` \`comprobante_transferencia\` varchar(255) NOT NULL`,
    );
  }
}
