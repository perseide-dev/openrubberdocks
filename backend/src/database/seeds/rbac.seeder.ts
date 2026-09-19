import { DataSource } from 'typeorm';
import { Seeder, runSeeder } from 'typeorm-extension';
import { PermissionsSeeder, RolesSeeder, CoreAdminSeeder } from '@database/seeds/rbac/index'

export class RbacSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    // 1. Seed base permissions first
    await runSeeder(dataSource, PermissionsSeeder);

    // 2. Seed roles and associate with permissions
    await runSeeder(dataSource, RolesSeeder);

    // 3. Seed initial core administrator and assign global Super Admin role
    await runSeeder(dataSource, CoreAdminSeeder);
  }
}

