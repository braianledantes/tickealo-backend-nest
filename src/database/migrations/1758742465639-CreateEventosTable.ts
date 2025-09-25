import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventosTable1758742465639 implements MigrationInterface {
    name = 'CreateEventosTable1758742465639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`entrada\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` varchar(255) NOT NULL, \`precio\` decimal(10,2) NOT NULL, \`cantidad\` int NOT NULL, \`evento_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`evento\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`inicio_at\` timestamp NOT NULL, \`fin_at\` timestamp NOT NULL, \`cancelado\` tinyint NOT NULL DEFAULT 0, \`portada_url\` varchar(255) NULL, \`banner_url\` varchar(255) NULL, \`capacidad\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`productora_id\` int NULL, \`lugar_id\` int NULL, \`cuenta_bancaria_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`entrada\` ADD CONSTRAINT \`FK_9e2cbaceeca73c69831f37a9962\` FOREIGN KEY (\`evento_id\`) REFERENCES \`evento\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`evento\` ADD CONSTRAINT \`FK_409b70631881e82abb9f54dabd2\` FOREIGN KEY (\`productora_id\`) REFERENCES \`productora\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`evento\` ADD CONSTRAINT \`FK_f36634e25ff45cb1a1b4bda082d\` FOREIGN KEY (\`lugar_id\`) REFERENCES \`lugar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`evento\` ADD CONSTRAINT \`FK_b2ca82bbbfd96c06e3a84274f86\` FOREIGN KEY (\`cuenta_bancaria_id\`) REFERENCES \`cuenta_bancaria\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`evento\` DROP FOREIGN KEY \`FK_b2ca82bbbfd96c06e3a84274f86\``);
        await queryRunner.query(`ALTER TABLE \`evento\` DROP FOREIGN KEY \`FK_f36634e25ff45cb1a1b4bda082d\``);
        await queryRunner.query(`ALTER TABLE \`evento\` DROP FOREIGN KEY \`FK_409b70631881e82abb9f54dabd2\``);
        await queryRunner.query(`ALTER TABLE \`entrada\` DROP FOREIGN KEY \`FK_9e2cbaceeca73c69831f37a9962\``);
        await queryRunner.query(`DROP TABLE \`evento\``);
        await queryRunner.query(`DROP TABLE \`entrada\``);
    }

}
