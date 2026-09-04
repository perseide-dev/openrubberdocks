import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Role } from '../../../modules/authorization/entities/role.entity';
import { Permission } from '../../../modules/authorization/entities/permission.entity';

export class RolesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    const allPermissions = await permissionRepository.find();

    // 1. Super Admin Role
    let superAdminRole = await roleRepository.findOne({
      where: { name: 'Super Admin' },
      relations: ['permissions'],
    });

    if (!superAdminRole) {
      superAdminRole = roleRepository.create({
        name: 'Super Admin',
        description: 'Global administrator with all permissions',
        isSystemDefined: true,
        permissions: allPermissions,
      });
      await roleRepository.save(superAdminRole);
    }

    // 2. External Reader Role
    let externalReaderRole = await roleRepository.findOne({
      where: { name: 'External Reader' },
      relations: ['permissions'],
    });

    if (!externalReaderRole) {
      const readPermissions = allPermissions.filter((p) => p.action.includes('read'));
      externalReaderRole = roleRepository.create({
        name: 'External Reader',
        description: 'External user with read-only access to specific scopes',
        isSystemDefined: true,
        permissions: readPermissions,
      });
      await roleRepository.save(externalReaderRole);
    }
  }
}
