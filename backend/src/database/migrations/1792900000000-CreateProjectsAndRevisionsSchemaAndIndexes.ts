import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectsAndRevisionsSchemaAndIndexes1792900000000
  implements MigrationInterface
{
  name = 'CreateProjectsAndRevisionsSchemaAndIndexes1792900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. file_revisions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "file_revisions" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "file_id" integer NOT NULL,
        "file_uuid" uuid NOT NULL,
        "title" character varying NOT NULL,
        "blocks_snapshot" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "created_by_id" integer,
        "created_by_uuid" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_file_revisions_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_file_revisions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_file_revisions_file_id" FOREIGN KEY ("file_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_file_revisions_created_by_id" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // 2. projects
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "icon" character varying,
        "cover_image" character varying,
        "color" character varying DEFAULT '#000000',
        "start_date" TIMESTAMP WITH TIME ZONE,
        "target_date" TIMESTAMP WITH TIME ZONE,
        "workspace_id" integer NOT NULL,
        "workspace_uuid" uuid NOT NULL,
        "created_by_id" integer,
        "created_by_uuid" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_projects_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_projects_workspace_id" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_projects_created_by_id" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // 3. project_file_links
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "project_file_links" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" integer NOT NULL,
        "project_uuid" uuid NOT NULL,
        "file_id" integer NOT NULL,
        "file_uuid" uuid NOT NULL,
        "attached_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_project_file_links_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_project_file_links_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_file_links_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_project_file_links_file_id" FOREIGN KEY ("file_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 4. task_statuses
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_statuses" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" integer NOT NULL,
        "project_uuid" uuid NOT NULL,
        "name" character varying NOT NULL,
        "category" character varying NOT NULL DEFAULT 'TODO',
        "color" character varying NOT NULL DEFAULT '#71717A',
        "order_index" integer NOT NULL DEFAULT 0,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_statuses_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_task_statuses_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_statuses_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 5. task_types
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_types" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" integer NOT NULL,
        "project_uuid" uuid NOT NULL,
        "name" character varying NOT NULL,
        "icon" character varying NOT NULL DEFAULT 'task',
        "color" character varying NOT NULL DEFAULT '#3B82F6',
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_types_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_task_types_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_types_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 6. task_property_definitions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_property_definitions" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" integer NOT NULL,
        "project_uuid" uuid NOT NULL,
        "name" character varying NOT NULL,
        "type" character varying NOT NULL DEFAULT 'text',
        "options" jsonb DEFAULT '[]'::jsonb,
        "order_index" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_property_definitions_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_task_property_definitions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_property_definitions_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 7. tasks
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" integer NOT NULL,
        "project_uuid" uuid NOT NULL,
        "status_id" integer NOT NULL,
        "status_uuid" uuid NOT NULL,
        "type_id" integer NOT NULL,
        "type_uuid" uuid NOT NULL,
        "parent_task_id" integer,
        "parent_task_uuid" uuid,
        "title" character varying NOT NULL,
        "description" text,
        "order_index" integer NOT NULL DEFAULT 0,
        "start_date" TIMESTAMP WITH TIME ZONE,
        "due_date" TIMESTAMP WITH TIME ZONE,
        "estimated_minutes" integer,
        "custom_properties" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "created_by_id" integer,
        "created_by_uuid" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tasks_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_status_id" FOREIGN KEY ("status_id") REFERENCES "task_statuses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_type_id" FOREIGN KEY ("type_id") REFERENCES "task_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_parent_task_id" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_created_by_id" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // 8. task_assignees
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_assignees" (
        "task_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        CONSTRAINT "PK_task_assignees" PRIMARY KEY ("task_id", "user_id"),
        CONSTRAINT "FK_task_assignees_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_task_assignees_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // 9. task_dependencies
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_dependencies" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "task_id" integer NOT NULL,
        "task_uuid" uuid NOT NULL,
        "depends_on_task_id" integer NOT NULL,
        "depends_on_task_uuid" uuid NOT NULL,
        "type" character varying NOT NULL DEFAULT 'BLOCKS',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_dependencies_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_task_dependencies_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_dependencies_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_task_dependencies_depends_on_task_id" FOREIGN KEY ("depends_on_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 10. task_time_logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_time_logs" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "task_id" integer NOT NULL,
        "task_uuid" uuid NOT NULL,
        "user_id" integer,
        "user_uuid" uuid,
        "minutes" integer NOT NULL,
        "date" date NOT NULL DEFAULT CURRENT_DATE,
        "description" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_time_logs_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_task_time_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_time_logs_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_task_time_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // 11. Foreign Key & Query Filter Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_role_scopes_user_id" ON "user_role_scopes" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_role_scopes_workspace_id" ON "user_role_scopes" ("workspace_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_workspace_members_user_id" ON "workspace_members" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_workspace_members_workspace_id" ON "workspace_members" ("workspace_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_pages_workspace_id" ON "pages" ("workspace_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_pages_workspace_uuid" ON "pages" ("workspace_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_pages_parent_page_id" ON "pages" ("parent_page_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_blocks_file_id" ON "blocks" ("file_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_blocks_file_uuid" ON "blocks" ("file_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_blocks_parent_block_id" ON "blocks" ("parent_block_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_file_revisions_file_uuid" ON "file_revisions" ("file_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_projects_workspace_uuid" ON "projects" ("workspace_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_project_file_links_project_uuid" ON "project_file_links" ("project_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_task_statuses_project_uuid" ON "task_statuses" ("project_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_task_types_project_uuid" ON "task_types" ("project_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_task_property_definitions_project_uuid" ON "task_property_definitions" ("project_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_project_uuid" ON "tasks" ("project_uuid")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_status_id" ON "tasks" ("status_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_type_id" ON "tasks" ("type_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_parent_task_id" ON "tasks" ("parent_task_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_task_assignees_task_id" ON "task_assignees" ("task_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_task_assignees_user_id" ON "task_assignees" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_task_time_logs_task_uuid" ON "task_time_logs" ("task_uuid")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_time_logs_task_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_assignees_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_assignees_task_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_parent_task_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_type_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_status_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_project_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_property_definitions_project_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_types_project_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_statuses_project_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_project_file_links_project_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_projects_workspace_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_file_revisions_file_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blocks_parent_block_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blocks_file_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blocks_file_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pages_parent_page_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pages_workspace_uuid"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pages_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_workspace_members_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_workspace_members_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_role_scopes_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_role_scopes_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_time_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_dependencies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_assignees"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_property_definitions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_statuses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_file_links"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "file_revisions"`);
  }
}
