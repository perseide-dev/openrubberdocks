import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStorageAndBlockTypes1792910000000 implements MigrationInterface {
    name = 'AddStorageAndBlockTypes1792910000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Expand blocks_type_enum with the 6 rich documentation block types
        const newBlockTypes = [
            'file_attachment',
            'table',
            'callout',
            'mermaid',
            'openapi_spec',
            'internal_link',
        ];
        for (const blockType of newBlockTypes) {
            await queryRunner.query(
                `ALTER TYPE "public"."blocks_type_enum" ADD VALUE IF NOT EXISTS '${blockType}'`,
            );
        }

        // 2. Add storage_quota_bytes to workspace table (500 MB default)
        await queryRunner.query(`
            ALTER TABLE "workspace"
            ADD COLUMN IF NOT EXISTS "storage_quota_bytes" bigint NOT NULL DEFAULT 524288000
        `);

        // 3. Create storage_attachments table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "storage_attachments" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workspace_id" integer NOT NULL,
                "workspace_uuid" uuid NOT NULL,
                "file_uuid" uuid,
                "original_name" character varying NOT NULL,
                "storage_key" character varying NOT NULL,
                "driver" character varying NOT NULL DEFAULT 'local',
                "mime_type" character varying NOT NULL,
                "size_bytes" bigint NOT NULL DEFAULT 0,
                "created_by_id" integer,
                "created_by_uuid" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_storage_attachments_uuid" UNIQUE ("uuid"),
                CONSTRAINT "UQ_storage_attachments_storage_key" UNIQUE ("storage_key"),
                CONSTRAINT "PK_storage_attachments_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_storage_attachments_workspace_id" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_storage_attachments_created_by_id" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_storage_attachments_workspace_uuid" ON "storage_attachments" ("workspace_uuid")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_storage_attachments_file_uuid" ON "storage_attachments" ("file_uuid")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_storage_attachments_file_uuid"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_storage_attachments_workspace_uuid"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "storage_attachments"`);
        await queryRunner.query(`ALTER TABLE "workspace" DROP COLUMN IF EXISTS "storage_quota_bytes"`);
    }
}
