import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '@moduleUsers/entities/user.entity';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { Permission } from '@moduleAuthorization/entities/permission.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { WorkspaceMember } from '@moduleWorkspace/entities/workspace-member.entity';
import { UserType } from '@moduleUsers/enums/users.enum';

export class DemoUsersSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const scopeRepository = dataSource.getRepository(UserRoleScope);
    const workspaceRepository = dataSource.getRepository(Workspace);
    const memberRepository = dataSource.getRepository(WorkspaceMember);

    // 1. Get Core User as workspace creator
    const coreUser = await userRepository.findOneBy({ type: UserType.COREADMIN });
    if (!coreUser) {
      throw new Error('Core Admin user must exist before running DemoUsersSeeder');
    }

    // 2. Ensure Demo Workspace exists
    let demoWorkspace = await workspaceRepository.findOneBy({ name: 'Demo Workspace' });
    if (!demoWorkspace) {
      demoWorkspace = workspaceRepository.create({
        name: 'Demo Workspace',
        description: 'Espacio de pruebas para verificación de Scoped RBAC',
        createdBy: coreUser,
        createdByUUID: coreUser.uuid,
      });
      await workspaceRepository.save(demoWorkspace);
    }

    // 3. Ensure 'Workspace Editor' role exists
    let editorRole = await roleRepository.findOne({
      where: { name: 'Workspace Editor' },
      relations: ['permissions'],
    });

    if (!editorRole) {
      const allPermissions = await permissionRepository.find();
      const editorPermissions = allPermissions.filter((p) =>
        ['workspace:read', 'workspace:write', 'document:read', 'document:write'].includes(p.action)
      );

      editorRole = roleRepository.create({
        name: 'Workspace Editor',
        description: 'Can read and write in assigned workspaces',
        isSystemDefined: true,
        permissions: editorPermissions,
      });
      await roleRepository.save(editorRole);
    }

    // 4. Ensure 'External Reader' role exists
    const externalRole = await roleRepository.findOneBy({ name: 'External Reader' });
    if (!externalRole) {
      throw new Error('External Reader role must exist before running DemoUsersSeeder');
    }

    // 5. Create or find internal user (Internal Editor)
    let internalUser = await userRepository.findOneBy({ rubberHandle: 'internal_editor' });
    if (!internalUser) {
      internalUser = userRepository.create({
        username: 'Internal Editor',
        rubberHandle: 'internal_editor',
        password: 'editorpassword123',
        type: UserType.INTERNAL,
      });
      await userRepository.save(internalUser);
    }

    // Assign scope and membership to internal user
    let internalScope = await scopeRepository.findOneBy({
      userId: internalUser.id,
      roleId: editorRole.id,
      workspaceId: demoWorkspace.id,
    });
    if (!internalScope) {
      internalScope = scopeRepository.create({
        user: internalUser,
        role: editorRole,
        workspace: demoWorkspace,
      });
      await scopeRepository.save(internalScope);
    }

    let internalMembership = await memberRepository.findOneBy({
      userId: internalUser.id,
      workspaceId: demoWorkspace.id,
    });
    if (!internalMembership) {
      internalMembership = memberRepository.create({
        user: internalUser,
        workspace: demoWorkspace,
      });
      await memberRepository.save(internalMembership);
    }

    // 6. Create or find external user (External Auditor)
    let externalUser = await userRepository.findOneBy({ rubberHandle: 'external_auditor' });
    if (!externalUser) {
      externalUser = userRepository.create({
        username: 'External Auditor',
        rubberHandle: 'external_auditor',
        password: 'auditorpassword123',
        type: UserType.EXTERNAL,
      });
      await userRepository.save(externalUser);
    }

    // Assign scope and membership to external user
    let externalScope = await scopeRepository.findOneBy({
      userId: externalUser.id,
      roleId: externalRole.id,
      workspaceId: demoWorkspace.id,
    });
    if (!externalScope) {
      externalScope = scopeRepository.create({
        user: externalUser,
        role: externalRole,
        workspace: demoWorkspace,
      });
      await scopeRepository.save(externalScope);
    }

    let externalMembership = await memberRepository.findOneBy({
      userId: externalUser.id,
      workspaceId: demoWorkspace.id,
    });
    if (!externalMembership) {
      externalMembership = memberRepository.create({
        user: externalUser,
        workspace: demoWorkspace,
      });
      await memberRepository.save(externalMembership);
    }
  }
}
