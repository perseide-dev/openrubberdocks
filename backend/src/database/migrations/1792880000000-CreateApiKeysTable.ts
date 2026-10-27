import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeysTable1792880000000 implements MigrationInterface {
  name = 'CreateApiKeysTable1792880000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "key_hash" character varying NOT NULL,
        "key_prefix" character varying(16) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "last_used_at" TIMESTAMP WITH TIME ZONE,
        "is_active" boolean NOT NULL DEFAULT true,
        "user_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_api_keys_uuid" UNIQUE ("uuid"),
        CONSTRAINT "UQ_api_keys_key_hash" UNIQUE ("key_hash"),
        CONSTRAINT "PK_api_keys_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_api_keys_key_hash" ON "api_keys" ("key_hash")
    `);

    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ADD CONSTRAINT "FK_api_keys_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_api_keys_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_api_keys_key_hash"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
  }
}
