import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateUsersTable1758124614376 implements MigrationInterface {
  name = 'CreateUsersTable1758124614376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_ae4578dcaed5adff96595e6166\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`email_verified_at\` timestamp NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_roles_role\` (\`userId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_5f9286e6c25594c6b88c108db7\` (\`userId\`), INDEX \`IDX_4be2f7adf862634f5f803d246b\` (\`roleId\`), PRIMARY KEY (\`userId\`, \`roleId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_5f9286e6c25594c6b88c108db77\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_4be2f7adf862634f5f803d246b8\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // seed roles admin, productora, validador and cliente
    await queryRunner.query(
      `INSERT INTO \`role\` (name, description) VALUES 
      ('admin', 'Administrador del sistema con todos los permisos'), 
      ('productora', 'Usuario que representa a una productora de eventos'), 
      ('validador', 'Usuario encargado de validar entradas de clientes'), 
      ('cliente', 'Usuario que compra entradas para eventos')`,
    );

    // seed admin user with email
    const hashedPassword = await bcrypt.hash('atomicos', 10);
    await queryRunner.query(
      `INSERT INTO \`user\` (username, email, password, email_verified_at) VALUES 
      ('braianledantes', 'braian.ledantes@est.fi.uncoma.edu.ar', '${hashedPassword}', NOW())`,
    );

    await queryRunner.query(
      `INSERT INTO \`user\` (username, email, password, email_verified_at) VALUES 
      ('clarapelozo', 'clara.pelozo@est.fi.uncoma.edu.ar', '${hashedPassword}', NOW())`,
    );

    await queryRunner.query(
      `INSERT INTO \`user\` (username, email, password, email_verified_at) VALUES 
      ('lucianaromano', 'luciana.romano@est.fi.uncoma.edu.ar', '${hashedPassword}', NOW())`,
    );

    // assign admin role to admin user
    await queryRunner.query(
      `INSERT INTO \`user_roles_role\` (userId, roleId) VALUES 
      ((SELECT id FROM \`user\` WHERE username = 'braianledantes'), 
      (SELECT id FROM \`role\` WHERE name = 'admin'))`,
    );

    await queryRunner.query(
      `INSERT INTO \`user_roles_role\` (userId, roleId) VALUES
        ((SELECT id FROM \`user\` WHERE username = 'clarapelozo'),
        (SELECT id FROM \`role\` WHERE name = 'admin'))`,
    );

    await queryRunner.query(
      `INSERT INTO \`user_roles_role\` (userId, roleId) VALUES
      ((SELECT id FROM \`user\` WHERE username = 'lucianaromano'),
      (SELECT id FROM \`role\` WHERE name = 'admin'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_4be2f7adf862634f5f803d246b8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_5f9286e6c25594c6b88c108db77\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4be2f7adf862634f5f803d246b\` ON \`user_roles_role\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5f9286e6c25594c6b88c108db7\` ON \`user_roles_role\``,
    );
    await queryRunner.query(`DROP TABLE \`user_roles_role\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ae4578dcaed5adff96595e6166\` ON \`role\``,
    );
    await queryRunner.query(`DROP TABLE \`role\``);
  }
}
