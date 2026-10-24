import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAssignableToRoles1792868035710 implements MigrationInterface {
  name = 'AddIsAssignableToRoles1792868035710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "is_assignable" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `UPDATE "roles" SET "is_assignable" = false WHERE "name" = 'Super Admin'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "is_assignable"`);
  }
}
