import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableProductora1763147201161 implements MigrationInterface {
  name = 'AlterTableProductora1763147201161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`productora\` CHANGE \`creditos_disponibles\` \`creditos_disponibles\` int NOT NULL DEFAULT '50'`,
    );

    await queryRunner.query(
      `UPDATE \`productora\` SET \`creditos_disponibles\` = \`creditos_disponibles\` + 50`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`productora\` CHANGE \`creditos_disponibles\` \`creditos_disponibles\` int NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(
      `UPDATE \`productora\` SET \`creditos_disponibles\` = GREATEST(0, \`creditos_disponibles\` - 50)`,
    );
  }
}
