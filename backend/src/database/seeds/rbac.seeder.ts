import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/authorization/entities/role.entity';
import { Permission } from '../../modules/authorization/entities/permission.entity';
import { UserRoleScope } from '../../modules/authorization/entities/user-role-scope.entity';
import { UserType } from '../../modules/users/enums/users.enum';

export class RbacSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const userRoleScopeRepository = dataSource.getRepository(UserRoleScope);

    // 1. Create Core User
    let coreUser = await userRepository.findOneBy({ type: UserType.COREADMIN });
    if (!coreUser) {
      coreUser = userRepository.create({
        username: 'Core Admin',
        rubberHandle: 'coreadmin',
        password: process.env.CORE_ADMIN_PASSWORD || 'supersecretpassword', // Configurable via environment variable
        type: UserType.COREADMIN,
      });
      await userRepository.save(coreUser);
    }

    // 2. Create Base Permissions
    const permissionsData = [
      { action: 'workspace:read' },
      { action: 'workspace:write' },
      { action: 'document:read' },
      { action: 'document:write' },
      { action: 'role:create' },
      { action: 'role:assign' },
      { action: 'global:audit' }
    ];

    const permissions: Permission[] = [];
    for (const p of permissionsData) {
      let permission = await permissionRepository.findOneBy({ action: p.action });
      if (!permission) {
        permission = permissionRepository.create(p);
        await permissionRepository.save(permission);
      }
      permissions.push(permission);
    }

    // 3. Create Super Admin Role
    let superAdminRole = await roleRepository.findOneBy({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = roleRepository.create({
        name: 'Super Admin',
        description: 'Global administrator with all permissions',
        isSystemDefined: true,
        permissions: permissions, // Give all permissions
      });
      await roleRepository.save(superAdminRole);
    }

    // 4. Create External Reader Role
    let externalReaderRole = await roleRepository.findOneBy({ name: 'External Reader' });
    if (!externalReaderRole) {
      const readPerms = permissions.filter(p => p.action.includes('read'));
      externalReaderRole = roleRepository.create({
        name: 'External Reader',
        description: 'External user with read-only access to specific scopes',
        isSystemDefined: true,
        permissions: readPerms,
      });
      await roleRepository.save(externalReaderRole);
    }

    // 5. Optionally assign Super Admin to Core User globally (workspaceId = null)
    let coreUserScope = await userRoleScopeRepository.findOneBy({ userId: coreUser.id, roleId: superAdminRole.id });
    if (!coreUserScope) {
      coreUserScope = userRoleScopeRepository.create({
        user: coreUser,
        role: superAdminRole,
        workspaceId: null, // Global scope
      });
      await userRoleScopeRepository.save(coreUserScope);
    }
  }
}
