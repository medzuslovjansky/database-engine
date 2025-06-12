import type { D1Database } from '@cloudflare/workers-types';
import { CreateAuthTables } from './CreateAuthTables';
import { D1MigrationRecordDTO } from './schema';
import { D1MigrationDefinition } from './types';

export interface D1AuthMigrationsConfig {
  db: D1Database;
  migrationsTableName: string;
}

/**
 * Sophisticated migration system that tracks applied migrations in a database table
 */
export class D1AuthMigrations {
  private readonly config: D1AuthMigrationsConfig;

  // List of all migrations in order
  private readonly migrations: D1MigrationDefinition[] = [CreateAuthTables];

  constructor(config: D1AuthMigrationsConfig) {
    this.config = config;
  }

  /**
   * Initialize the migrations table if it doesn't exist
   */
  private async ensureMigrationsTable(): Promise<void> {
    await this.config.db.exec(`CREATE TABLE IF NOT EXISTS ${this.config.migrationsTableName} \
      (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, \
       applied_at INTEGER NOT NULL, batch INTEGER NOT NULL)`);
    await this.config.db.exec(`CREATE INDEX IF NOT EXISTS idx_migrations_name \
      ON ${this.config.migrationsTableName}(name)`);
    await this.config.db.exec(`CREATE INDEX IF NOT EXISTS idx_migrations_batch \
      ON ${this.config.migrationsTableName}(batch)`);
  }

  /**
   * Get list of applied migrations
   */
  async getAppliedMigrations(): Promise<D1MigrationRecordDTO[]> {
    await this.ensureMigrationsTable();

    const result = await this.config.db.prepare(`SELECT id, name, applied_at, batch \
      FROM ${this.config.migrationsTableName} ORDER BY id ASC`).all<D1MigrationRecordDTO>();

    return result.results;
  }

  /**
   * Get pending migrations that haven't been applied yet
   */
  async getPendingMigrations(): Promise<D1MigrationDefinition[]> {
    const applied = await this.getAppliedMigrations();
    const appliedNames = new Set(applied.map(m => m.name));

    return this.migrations.filter(migration => !appliedNames.has(migration.name));
  }

  /**
   * Get the next batch number
   */
  private async getNextBatch(): Promise<number> {
    const result = await this.config.db.prepare(`SELECT COALESCE(MAX(batch), 0) + 1 as next_batch \
      FROM ${this.config.migrationsTableName}`).first() as { next_batch: number } | null;

    return result?.next_batch || 1;
  }

  /**
   * Record a migration as applied
   */
  private async recordMigration(name: string, batch: number): Promise<void> {
    await this.config.db.prepare(`INSERT INTO ${this.config.migrationsTableName} \
      (name, applied_at, batch) VALUES (?1, ?2, ?3)`).bind(name, Date.now(), batch).run();
  }

  /**
   * Remove a migration record
   */
  private async removeMigrationRecord(name: string): Promise<void> {
    await this.config.db.prepare(`DELETE FROM ${this.config.migrationsTableName} \
      WHERE name = ?1`).bind(name).run();
  }

  /**
   * Run all pending migrations
   */
  async up(): Promise<{ applied: string[], skipped: string[] }> {
    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      return { applied: [], skipped: this.migrations.map(m => m.name) };
    }

    const batch = await this.getNextBatch();
    const applied: string[] = [];

    for (const migration of pending) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up(this.config.db);
      await this.recordMigration(migration.name, batch);
      applied.push(migration.name);
    }

    return {
      applied,
      skipped: this.migrations.filter(m => !applied.includes(m.name)).map(m => m.name)
    };
  }

  /**
   * Rollback migrations from the latest batch
   */
  async down(): Promise<{ rolledBack: string[] }> {
    const appliedMigrations = await this.getAppliedMigrations();

    if (appliedMigrations.length === 0) {
      return { rolledBack: [] };
    }

    // Get the latest batch
    const latestBatch = Math.max(...appliedMigrations.map(m => m.batch));
    const migrationsToRollback = appliedMigrations
      .filter(m => m.batch === latestBatch)
      .reverse(); // Rollback in reverse order

    const rolledBack: string[] = [];

    for (const record of migrationsToRollback) {
      const migration = this.migrations.find(m => m.name === record.name);
      if (migration) {
        console.log(`Rolling back migration: ${migration.name}`);
        await migration.down(this.config.db);
        await this.removeMigrationRecord(record.name);
        rolledBack.push(migration.name);
      }
    }

    return { rolledBack };
  }

  /**
   * Reset all migrations (rollback all, then apply all)
   */
  async reset(): Promise<{ rolledBack: string[], applied: string[] }> {
    // Rollback all migrations
    const rolledBack: string[] = [];
    let rollbackResult = await this.down();
    rolledBack.push(...rollbackResult.rolledBack);

    // Keep rolling back until no more migrations
    while (rollbackResult.rolledBack.length > 0) {
      rollbackResult = await this.down();
      rolledBack.push(...rollbackResult.rolledBack);
    }

    // Apply all migrations
    const upResult = await this.up();

    return {
      rolledBack,
      applied: upResult.applied
    };
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    total: number;
    applied: number;
    pending: number;
    appliedMigrations: D1MigrationRecordDTO[];
    pendingMigrations: D1MigrationDefinition[];
  }> {
    const applied = await this.getAppliedMigrations();
    const pending = await this.getPendingMigrations();

    return {
      total: this.migrations.length,
      applied: applied.length,
      pending: pending.length,
      appliedMigrations: applied,
      pendingMigrations: pending
    };
  }

  /**
   * Check if all migrations are applied
   */
  async isUpToDate(): Promise<boolean> {
    const pending = await this.getPendingMigrations();
    return pending.length === 0;
  }
}
