import { MigrationInterface, QueryRunner } from "typeorm";

export class RbacSystem1700000000000 implements MigrationInterface {
    name = 'RbacSystem1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Since we are adding the RBAC system, we create the new tables
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" character varying NOT NULL,
                CONSTRAINT "UQ_permissions_uuid" UNIQUE ("uuid"),
                CONSTRAINT "UQ_permissions_action" UNIQUE ("action"),
                CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "isSystemDefined" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_roles_uuid" UNIQUE ("uuid"),
                CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
                CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "roleId" integer NOT NULL,
                "permissionId" integer NOT NULL,
                CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "user_role_scopes" (
                "id" SERIAL NOT NULL,
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" integer NOT NULL,
                "roleId" integer NOT NULL,
                "workspaceId" integer,
                "squadId" integer,
                CONSTRAINT "UQ_user_role_scopes_uuid" UNIQUE ("uuid"),
                CONSTRAINT "PK_user_role_scopes_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign keys
        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_role_permissions_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_role_permissions_permissionId" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "user_role_scopes"
            ADD CONSTRAINT "FK_user_role_scopes_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "user_role_scopes"
            ADD CONSTRAINT "FK_user_role_scopes_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "user_role_scopes"
            ADD CONSTRAINT "FK_user_role_scopes_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role_scopes" DROP CONSTRAINT "FK_user_role_scopes_workspaceId"`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" DROP CONSTRAINT "FK_user_role_scopes_roleId"`);
        await queryRunner.query(`ALTER TABLE "user_role_scopes" DROP CONSTRAINT "FK_user_role_scopes_userId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permissionId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_roleId"`);

        await queryRunner.query(`DROP TABLE "user_role_scopes"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }
}
