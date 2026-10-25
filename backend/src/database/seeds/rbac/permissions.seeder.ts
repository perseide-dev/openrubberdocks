import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Permission } from '@moduleAuthorization/entities/permission.entity';

export const BASE_PERMISSIONS = [
  { action: 'workspace:read' },
  { action: 'workspace:write' },
  { action: 'workspace:create' },
  { action: 'workspace:delete' },
  { action: 'document:read' },
  { action: 'document:write' },
  { action: 'document:delete' },
  { action: 'project:read' },
  { action: 'project:create' },
  { action: 'project:update' },
  { action: 'project:delete' },
  { action: 'task:read' },
  { action: 'task:create' },
  { action: 'task:update' },
  { action: 'task:delete' },
  { action: 'task:time_log' },
  { action: 'task_type:manage' },
  { action: 'task_status:manage' },
  { action: 'task_property:manage' },
  { action: 'role:read' },
  { action: 'role:create' },
  { action: 'role:update' },
  { action: 'role:delete' },
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
