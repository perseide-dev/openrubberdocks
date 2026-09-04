import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Permission } from '../../../modules/authorization/entities/permission.entity';

export const BASE_PERMISSIONS = [
  { action: 'workspace:read' },
  { action: 'workspace:write' },
  { action: 'document:read' },
  { action: 'document:write' },
  { action: 'role:create' },
  { action: 'role:assign' },
  { action: 'global:audit' },
];

export class PermissionsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<Permission[]> {
    const permissionRepository = dataSource.getRepository(Permission);
    const permissions: Permission[] = [];

    for (const p of BASE_PERMISSIONS) {
      let permission = await permissionRepository.findOneBy({ action: p.action });
      if (!permission) {
        permission = permissionRepository.create(p);
        await permissionRepository.save(permission);
      }
      permissions.push(permission);
    }

    return permissions;
  }
}
