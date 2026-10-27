import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788492105093 implements MigrationInterface {
    name = 'InitialSchema1788492105093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_type_enum" AS ENUM('coreAdmin', 'internal', 'external')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "rubber_handle" character varying NOT NULL, "password" character varying NOT NULL, "hashed_refresh_token" character varying, "type" "public"."users_type_enum" NOT NULL DEFAULT 'internal', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_951b8f1dfc94ac1d0301a14b7e1" UNIQUE ("uuid"), CONSTRAINT "UQ_9bb00e91d3341c441584b7dbfd6" UNIQUE ("rubber_handle"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workspace_members" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "workspace_id" integer NOT NULL, "joined_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_22ab43ac5865cd62769121d2bc4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workspace" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_by_uuid" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" integer, CONSTRAINT "UQ_ee78a3da1b84780b34a739d04ab" UNIQUE ("uuid"), CONSTRAINT "PK_ca86b6f9b3be5fe26d307d09b49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "block_revisions" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "block_id" integer NOT NULL, "block_uuid" uuid, "properties" jsonb, "created_by_id" integer, "created_by_uuid" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b4b0be211c17d99f4ebe92c1932" UNIQUE ("uuid"), CONSTRAINT "PK_32fb40c1472fb2fe4f82f79c744" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."blocks_type_enum" AS ENUM('text', 'heading_1', 'heading_2', 'heading_3', 'bullet_list', 'numbered_list', 'todo', 'image', 'code', 'quote', 'divider')`);
        await queryRunner.query(`CREATE TABLE "blocks" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_id" integer NOT NULL, "file_uuid" uuid, "parent_block_id" integer, "parent_block_uuid" uuid, "type" "public"."blocks_type_enum" NOT NULL DEFAULT 'text', "properties" jsonb, "order_index" double precision NOT NULL, "created_by_id" integer, "created_by_uuid" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cc1b8429277b0f51466bd75f42e" UNIQUE ("uuid"), CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pages" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspace_id" integer NOT NULL, "workspace_uuid" uuid, "parent_page_id" integer, "parent_page_uuid" uuid, "title" character varying NOT NULL, "icon" character varying, "cover_image" character varying, "is_template" boolean NOT NULL DEFAULT false, "created_by_id" integer, "created_by_uuid" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_845e77701228c752e9787e6220f" UNIQUE ("uuid"), CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id")); COMMENT ON COLUMN "pages"."icon" IS 'Emoji o URL'; COMMENT ON COLUMN "pages"."cover_image" IS 'URL'; COMMENT ON COLUMN "pages"."is_template" IS 'Clave para el sistema de templates'`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, CONSTRAINT "UQ_82c4b329177eba3db6338f732c5" UNIQUE ("uuid"), CONSTRAINT "UQ_1c1e0637ecf1f6401beb9a68abe" UNIQUE ("action"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "is_system_defined" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_cdc7776894e484eaed828ca0616" UNIQUE ("uuid"), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_role_scopes" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "role_id" integer NOT NULL, "workspace_id" integer, "squad_id" integer, CONSTRAINT "UQ_fe395ca3d354542775e523f39f3" UNIQUE ("uuid"), CONSTRAINT "PK_78f706bb81aefff0b23c4e21c50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_4e83431119fa585fc7aa8b817db" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_4a7c584ddfe855379598b5e20fd" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace" ADD CONSTRAINT "FK_933a49110f80bcbae6bcce6a25e" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_revisions" ADD CONSTRAINT "FK_c6833269da2e03a52b9293f618a" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_revisions" ADD CONSTRAINT "FK_3ffd9ae0ac9399c49d88e95bb3c" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_635083c1647d7599524aca60a62" FOREIGN KEY ("file_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_e8097178bac183f1393047751fa" FOREIGN KEY ("parent_block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_9bf474613d7d27c3cda61f37ac2" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_e81517e2f307170573c9be6f581" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_c4dd5f1b1eb8fb5c79ad236f256" FOREIGN KEY ("parent_page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_013b1eaf7f474ea4a78b827f445" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" ADD CONSTRAINT "FK_8b3c7d5c0baf806f9c6ce5bdd2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" ADD CONSTRAINT "FK_b58a19befd6e2faace7e8c2a82e" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" ADD CONSTRAINT "FK_22c826a09ccf009ca14c18c4194" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" DROP CONSTRAINT "FK_22c826a09ccf009ca14c18c4194"`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" DROP CONSTRAINT "FK_b58a19befd6e2faace7e8c2a82e"`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" DROP CONSTRAINT "FK_8b3c7d5c0baf806f9c6ce5bdd2b"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_013b1eaf7f474ea4a78b827f445"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_c4dd5f1b1eb8fb5c79ad236f256"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_e81517e2f307170573c9be6f581"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_9bf474613d7d27c3cda61f37ac2"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_e8097178bac183f1393047751fa"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_635083c1647d7599524aca60a62"`);
        await queryRunner.query(`ALTER TABLE "block_revisions" DROP CONSTRAINT "FK_3ffd9ae0ac9399c49d88e95bb3c"`);
        await queryRunner.query(`ALTER TABLE "block_revisions" DROP CONSTRAINT "FK_c6833269da2e03a52b9293f618a"`);
        await queryRunner.query(`ALTER TABLE "workspace" DROP CONSTRAINT "FK_933a49110f80bcbae6bcce6a25e"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_4a7c584ddfe855379598b5e20fd"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_4e83431119fa585fc7aa8b817db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "user_role_scopes"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "pages"`);
        await queryRunner.query(`DROP TABLE "blocks"`);
        await queryRunner.query(`DROP TYPE "public"."blocks_type_enum"`);
        await queryRunner.query(`DROP TABLE "block_revisions"`);
        await queryRunner.query(`DROP TABLE "workspace"`);
        await queryRunner.query(`DROP TABLE "workspace_members"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
    }

}
