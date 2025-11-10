import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEstadoTicket1762814591112 implements MigrationInterface {
    name = 'AddEstadoTicket1762814591112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`estado\` \`estado\` enum ('INICIADO', 'COMPRA_PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO', 'TRANSFERIDO') NOT NULL DEFAULT 'INICIADO'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`estado\` \`estado\` enum ('INICIADO', 'COMPRA_PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO') NOT NULL DEFAULT 'INICIADO'`);
    }

}
