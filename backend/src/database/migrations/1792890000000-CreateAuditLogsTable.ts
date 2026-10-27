import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1792890000000 implements MigrationInterface {
  name = 'CreateAuditLogsTable1792890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" integer,
        "user_email" character varying(255),
        "user_type" character varying(50),
        "action" character varying(100) NOT NULL,
        "resource_type" character varying(50) NOT NULL,
        "resource_uuid" character varying(100),
        "workspace_uuid" character varying(100),
        "status" character varying(20) NOT NULL,
        "status_code" integer NOT NULL,
        "execution_time_ms" integer NOT NULL DEFAULT 0,
        "ip_address" character varying(45),
        "user_agent" text,
        "payload" jsonb,
        "error_message" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_audit_logs_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_resource_type" ON "audit_logs" ("resource_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_workspace_uuid" ON "audit_logs" ("workspace_uuid")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at" DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_workspace_uuid"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_resource_type"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_user_id"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
