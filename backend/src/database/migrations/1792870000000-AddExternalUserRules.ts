import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalUserRules1792870000000 implements MigrationInterface {
  name = 'AddExternalUserRules1792870000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "can_view_documents" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "can_view_projects" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "can_view_projects"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "can_view_documents"`);
  }
}
