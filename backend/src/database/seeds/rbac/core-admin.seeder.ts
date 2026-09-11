import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../../modules/users/entities/user.entity';
import { Role } from '../../../modules/authorization/entities/role.entity';
import { UserRoleScope } from '../../../modules/authorization/entities/user-role-scope.entity';
import { UserType } from '../../../modules/users/enums/users.enum';

export class CoreAdminSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const userRoleScopeRepository = dataSource.getRepository(UserRoleScope);

    // 1. Ensure Core Admin User exists
    let coreUser = await userRepository.findOneBy({ type: UserType.COREADMIN });
    if (!coreUser) {
      coreUser = userRepository.create({
        username: process.env.CORE_ADMIN_USERNAME || 'Core Admin',
        rubberHandle: process.env.CORE_ADMIN_HANDLE || 'coreadmin',
        password: process.env.CORE_ADMIN_PASSWORD || 'supersecretpassword',
        type: UserType.COREADMIN,
      });
      await userRepository.save(coreUser);
    }

    // 2. Find Super Admin role
    const superAdminRole = await roleRepository.findOneBy({ name: 'Super Admin' });
    if (!superAdminRole) {
      throw new Error('Super Admin role must exist before running CoreAdminSeeder');
    }

    // 3. Assign Super Admin role to Core User in global scope (workspaceId = null)
    let coreUserScope = await userRoleScopeRepository.findOneBy({
      userId: coreUser.id,
      roleId: superAdminRole.id,
    });

    if (!coreUserScope) {
      coreUserScope = userRoleScopeRepository.create({
        user: coreUser,
        role: superAdminRole,
        workspaceId: null,
      });
      await userRoleScopeRepository.save(coreUserScope);
    }
  }
}
