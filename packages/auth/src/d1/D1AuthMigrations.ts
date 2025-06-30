import {
  D1Migrations,
  type D1MigrationsConfig,
} from '@interslavic/database-engine-database-d1';

import * as migrations from './migrations';

/**
 * Sophisticated migration system that tracks applied migrations in a database table
 */
export class D1AuthMigrations extends D1Migrations {
  constructor(config: Omit<D1MigrationsConfig, 'migrations'>) {
    super({
      ...config,
      migrations: [migrations.CreateAuthTables],
    });
  }
}
