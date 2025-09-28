import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterValidadorTable1759083407740 implements MigrationInterface {
  name = 'AlterValidadorTable1759083407740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // elimina todos los validadores existentes para evitar conflictos con la nueva estructura
    await queryRunner.query(`DELETE FROM \`validador\` WHERE 1`);

    await queryRunner.query(
      `ALTER TABLE \`validador\` DROP FOREIGN KEY \`FK_0d90ac38c56974c63d77d4f4791\``,
    );
    await queryRunner.query(`ALTER TABLE \`validador\` DROP COLUMN \`nombre\``);
    await queryRunner.query(
      `ALTER TABLE \`validador\` DROP COLUMN \`imagen_perfil_url\``,
    );
    await queryRunner.query(`ALTER TABLE \`evento\` DROP COLUMN \`inicio_at\``);
    await queryRunner.query(
      `ALTER TABLE \`evento\` ADD \`inicio_at\` timestamp NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`evento\` DROP COLUMN \`fin_at\``);
    await queryRunner.query(
      `ALTER TABLE \`evento\` ADD \`fin_at\` timestamp NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`validador\` ADD CONSTRAINT \`FK_0d90ac38c56974c63d77d4f4791\` FOREIGN KEY (\`user_id\`) REFERENCES \`cliente\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validador\` DROP FOREIGN KEY \`FK_0d90ac38c56974c63d77d4f4791\``,
    );
    await queryRunner.query(`ALTER TABLE \`evento\` DROP COLUMN \`fin_at\``);
    await queryRunner.query(
      `ALTER TABLE \`evento\` ADD \`fin_at\` datetime NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`evento\` DROP COLUMN \`inicio_at\``);
    await queryRunner.query(
      `ALTER TABLE \`evento\` ADD \`inicio_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`validador\` ADD \`imagen_perfil_url\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`validador\` ADD \`nombre\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`validador\` ADD CONSTRAINT \`FK_0d90ac38c56974c63d77d4f4791\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
