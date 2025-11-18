import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePuntosTable1763462542648 implements MigrationInterface {
    name = 'CreatePuntosTable1763462542648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`punto\` (\`id\` int NOT NULL AUTO_INCREMENT, \`puntos_usados\` int NOT NULL, \`puntos_ganados\` int NOT NULL, \`puntos_previos\` int NOT NULL, \`puntos_obtenidos\` int NOT NULL, \`fecha_vencimiento\` timestamp NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`clienteUserId\` int NULL, \`compraId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`punto\` ADD CONSTRAINT \`FK_42ab5a931926a88bb9b8533b40e\` FOREIGN KEY (\`clienteUserId\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`punto\` ADD CONSTRAINT \`FK_99a66a592ae2eb39a29bf98982a\` FOREIGN KEY (\`compraId\`) REFERENCES \`compra\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`punto\` DROP FOREIGN KEY \`FK_99a66a592ae2eb39a29bf98982a\``);
        await queryRunner.query(`ALTER TABLE \`punto\` DROP FOREIGN KEY \`FK_42ab5a931926a88bb9b8533b40e\``);
        await queryRunner.query(`DROP TABLE \`punto\``);
    }

}
