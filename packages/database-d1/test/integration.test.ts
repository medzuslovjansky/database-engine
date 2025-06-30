import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type {D1Database} from '@cloudflare/workers-types';
import type {D1MigrationDefinition, D1MigrationsLogger} from '@database-d1/index';
import { D1UnitOfWork, D1Migrations } from '@database-d1/index';

describe('D1 Database Module Integration', () => {
  let db: D1Database;
  let unitOfWork: D1UnitOfWork;
  let migrations: D1Migrations;
  let logger: D1MigrationsLogger;

  class SampleMigration001 implements D1MigrationDefinition {
    name = 'sample_migration_001';

    async up(db: D1Database): Promise<void> {
      await db.exec('CREATE TABLE IF NOT EXISTS test_table (\
        id TEXT PRIMARY KEY,\
        name TEXT NOT NULL,\
        created_at INTEGER NOT NULL\
      );');
    }

    async down(db: D1Database): Promise<void> {
      await db.exec('DROP TABLE IF EXISTS test_table;');
    }
  }

  class SampleMigration002 implements D1MigrationDefinition {
    name = 'sample_migration_002';

    async up(db: D1Database): Promise<void> {
      await db.exec('CREATE TABLE IF NOT EXISTS users (\
        id TEXT PRIMARY KEY,\
        email TEXT NOT NULL UNIQUE,\
        created_at INTEGER NOT NULL\
      );');
    }

    async down(db: D1Database): Promise<void> {
      await db.exec('DROP TABLE IF EXISTS users;');
    }
  }

  class SampleMigration003 implements D1MigrationDefinition {
    name = 'sample_migration_003';

    async up(db: D1Database): Promise<void> {
      await db.exec('ALTER TABLE users ADD COLUMN last_login INTEGER;');
    }

    async down(db: D1Database): Promise<void> {
      // SQLite doesn't support DROP COLUMN, so we'd need to recreate table
      await db.exec('CREATE TABLE users_temp AS SELECT id, email, created_at FROM users;');
      await db.exec('DROP TABLE users;');
      await db.exec('CREATE TABLE users (\
        id TEXT PRIMARY KEY,\
        email TEXT NOT NULL UNIQUE,\
        created_at INTEGER NOT NULL\
      );');
      await db.exec('INSERT INTO users SELECT * FROM users_temp;');
      await db.exec('DROP TABLE users_temp;');
    }
  }

  beforeAll(async () => {
    db = globalThis.__MINIFLARE_DB__;
  });

  beforeEach(async () => {
    // Clean up any existing migrations table before each test
    await db.exec('DROP TABLE IF EXISTS Migrations');
    await db.exec('DROP TABLE IF EXISTS test_table');
    await db.exec('DROP TABLE IF EXISTS users');
    await db.exec('DROP TABLE IF EXISTS users_temp');

    logger = {
      runningMigration: vi.fn(),
      rollingBackMigration: vi.fn(),
    }
  });

  describe('D1Migrations', () => {
    beforeEach(() => {
      unitOfWork = new D1UnitOfWork({ db });
      migrations = new D1Migrations({
        db,
        logger,
        migrations: [
          new SampleMigration001(),
          new SampleMigration002(),
          new SampleMigration003()
        ],
      });
    });

    describe('getAppliedMigrations', () => {
      it('should return empty array when no migrations are applied', async () => {
        const applied = await migrations.getAppliedMigrations();
        expect(applied).toEqual([]);
      });

      it('should return applied migrations in order', async () => {
        // Apply first two migrations
        const singleMigration = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001(), new SampleMigration002()],
        });
        await singleMigration.up();

        const applied = await migrations.getAppliedMigrations();
        expect(applied).toHaveLength(2);
        expect(applied[0].name).toBe('sample_migration_001');
        expect(applied[1].name).toBe('sample_migration_002');
        expect(applied[0].batch).toBe(1);
        expect(applied[1].batch).toBe(1);
      });
    });

    describe('getPendingMigrations', () => {
      it('should return all migrations when none are applied', async () => {
        const pending = await migrations.getPendingMigrations();
        expect(pending).toHaveLength(3);
        expect(pending.map(m => m.name)).toEqual([
          'sample_migration_001',
          'sample_migration_002',
          'sample_migration_003'
        ]);
      });

      it('should return only unapplied migrations', async () => {
        // Apply first migration only
        const partialMigrations = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001()],
        });
        await partialMigrations.up();

        const pending = await migrations.getPendingMigrations();
        expect(pending).toHaveLength(2);
        expect(pending.map(m => m.name)).toEqual([
          'sample_migration_002',
          'sample_migration_003'
        ]);
      });

      it('should return empty array when all migrations are applied', async () => {
        await migrations.up();
        const pending = await migrations.getPendingMigrations();
        expect(pending).toEqual([]);
      });
    });

         describe('up', () => {
       it('should apply all pending migrations and return results', async () => {
         const result = await migrations.up();

         expect(result.applied).toEqual([
           'sample_migration_001',
           'sample_migration_002',
           'sample_migration_003'
         ]);
         expect(result.skipped).toEqual([]);

         // Verify logger was called for each migration
         expect(logger.runningMigration).toHaveBeenCalledTimes(3);
         expect(logger.runningMigration).toHaveBeenNthCalledWith(1, 'sample_migration_001');
         expect(logger.runningMigration).toHaveBeenNthCalledWith(2, 'sample_migration_002');
         expect(logger.runningMigration).toHaveBeenNthCalledWith(3, 'sample_migration_003');
         expect(logger.rollingBackMigration).not.toHaveBeenCalled();

         // Verify tables were created
         const testTable = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='test_table'").first();
         const usersTable = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").first();
         expect(testTable?.name).toBe('test_table');
         expect(usersTable?.name).toBe('users');
       });

             it('should skip already applied migrations', async () => {
         // Apply first migration
         const partialMigrations = new D1Migrations({
           db,
           logger,
           migrations: [new SampleMigration001()],
         });
         await partialMigrations.up();

         // Reset logger calls from the partial migration
         vi.clearAllMocks();

         // Apply all migrations
         const result = await migrations.up();

         expect(result.applied).toEqual([
           'sample_migration_002',
           'sample_migration_003'
         ]);
         expect(result.skipped).toEqual(['sample_migration_001']);

         // Verify logger was only called for new migrations
         expect(logger.runningMigration).toHaveBeenCalledTimes(2);
         expect(logger.runningMigration).toHaveBeenNthCalledWith(1, 'sample_migration_002');
         expect(logger.runningMigration).toHaveBeenNthCalledWith(2, 'sample_migration_003');
         expect(logger.rollingBackMigration).not.toHaveBeenCalled();
       });

             it('should return empty applied and all skipped when no pending migrations', async () => {
         await migrations.up(); // Apply all

         // Reset logger calls from the first up() call
         vi.clearAllMocks();

         const result = await migrations.up(); // Try again

         expect(result.applied).toEqual([]);
         expect(result.skipped).toEqual([
           'sample_migration_001',
           'sample_migration_002',
           'sample_migration_003'
         ]);

         // Verify logger was not called when no migrations to apply
         expect(logger.runningMigration).not.toHaveBeenCalled();
         expect(logger.rollingBackMigration).not.toHaveBeenCalled();
       });
    });

    describe('down', () => {
      it('should rollback latest batch of migrations', async () => {
        await migrations.up(); // Apply all in one batch

        const result = await migrations.down();

        expect(result.rolledBack).toEqual([
          'sample_migration_003',
          'sample_migration_002',
          'sample_migration_001'
        ]);

        // Verify tables were dropped
        const testTable = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='test_table'").first();
        const usersTable = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").first();
        expect(testTable).toBeNull();
        expect(usersTable).toBeNull();
      });

      it('should rollback only the latest batch when migrations applied in multiple batches', async () => {
        // Apply first migration
        const firstMigration = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001()],
        });
        await firstMigration.up();

        // Apply second and third migrations in a new batch
        const laterMigrations = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001(), new SampleMigration002(), new SampleMigration003()],
        });
        await laterMigrations.up();

        // Rollback should only affect latest batch
        const result = await migrations.down();

        expect(result.rolledBack).toEqual([
          'sample_migration_003',
          'sample_migration_002'
        ]);

        // First migration should still be applied
        const applied = await migrations.getAppliedMigrations();
        expect(applied).toHaveLength(1);
        expect(applied[0].name).toBe('sample_migration_001');
      });

      it('should return empty array when no migrations to rollback', async () => {
        const result = await migrations.down();
        expect(result.rolledBack).toEqual([]);
      });
    });

    describe('reset', () => {
      it('should rollback all migrations then apply all', async () => {
        // Apply some migrations first
        await migrations.up();

        const result = await migrations.reset();

        expect(result.rolledBack).toEqual([
          'sample_migration_003',
          'sample_migration_002',
          'sample_migration_001'
        ]);
        expect(result.applied).toEqual([
          'sample_migration_001',
          'sample_migration_002',
          'sample_migration_003'
        ]);

        // Verify all migrations are applied again
        const status = await migrations.getStatus();
        expect(status.applied).toBe(3);
        expect(status.pending).toBe(0);
      });

      it('should handle multiple batches during reset', async () => {
        // Apply migrations in multiple batches
        const firstMigration = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001()],
        });
        await firstMigration.up();

        const secondMigration = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001(), new SampleMigration002()],
        });
        await secondMigration.up();

        const result = await migrations.reset();

        expect(result.rolledBack).toContain('sample_migration_001');
        expect(result.rolledBack).toContain('sample_migration_002');
        expect(result.applied).toEqual([
          'sample_migration_001',
          'sample_migration_002',
          'sample_migration_003'
        ]);
      });
    });

    describe('getStatus', () => {
      it('should return correct status when no migrations applied', async () => {
        const status = await migrations.getStatus();

        expect(status.total).toBe(3);
        expect(status.applied).toBe(0);
        expect(status.pending).toBe(3);
        expect(status.appliedMigrations).toEqual([]);
        expect(status.pendingMigrations).toHaveLength(3);
      });

      it('should return correct status with partial migrations applied', async () => {
        // Apply first migration only
        const partialMigrations = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001()],
        });
        await partialMigrations.up();

        const status = await migrations.getStatus();

        expect(status.total).toBe(3);
        expect(status.applied).toBe(1);
        expect(status.pending).toBe(2);
        expect(status.appliedMigrations).toHaveLength(1);
        expect(status.appliedMigrations[0].name).toBe('sample_migration_001');
        expect(status.pendingMigrations).toHaveLength(2);
      });

      it('should return correct status when all migrations applied', async () => {
        await migrations.up();

        const status = await migrations.getStatus();

        expect(status.total).toBe(3);
        expect(status.applied).toBe(3);
        expect(status.pending).toBe(0);
        expect(status.appliedMigrations).toHaveLength(3);
        expect(status.pendingMigrations).toEqual([]);
      });
    });

    describe('isUpToDate', () => {
      it('should return false when migrations are pending', async () => {
        const isUpToDate = await migrations.isUpToDate();
        expect(isUpToDate).toBe(false);
      });

      it('should return false when only some migrations are applied', async () => {
        // Apply first migration only
        const partialMigrations = new D1Migrations({
          db,
          logger,
          migrations: [new SampleMigration001()],
        });
        await partialMigrations.up();

        const isUpToDate = await migrations.isUpToDate();
        expect(isUpToDate).toBe(false);
      });

      it('should return true when all migrations are applied', async () => {
        await migrations.up();

        const isUpToDate = await migrations.isUpToDate();
        expect(isUpToDate).toBe(true);
      });
    });
  });

  describe('D1UnitOfWork', () => {
    beforeEach(async () => {
      // Set up a test table for unit of work tests
      migrations = new D1Migrations({
        db,
        logger,
        migrations: [new SampleMigration001()],
      });
      await migrations.up();
      unitOfWork = new D1UnitOfWork({ db });
    });

    it('should insert something in batch using unit of work', async () => {
      // Add multiple statements to unit of work
      unitOfWork.addStatement(
        db.prepare('INSERT INTO test_table (id, name, created_at) VALUES (?, ?, ?)')
          .bind('1', 'Test Item 1', Date.now())
      );

      unitOfWork.addStatement(
        db.prepare('INSERT INTO test_table (id, name, created_at) VALUES (?, ?, ?)')
          .bind('2', 'Test Item 2', Date.now())
      );

      // Commit the batch
      await unitOfWork.commit();

      // Verify the data was inserted
      const count = await db.prepare('SELECT COUNT(*) as count FROM test_table').first();
      expect(count?.count).toBe(2);

      const items = await db.prepare('SELECT * FROM test_table ORDER BY id').all();
      expect(items.results).toHaveLength(2);
      expect(items.results[0].name).toBe('Test Item 1');
      expect(items.results[1].name).toBe('Test Item 2');
    });
  });
});
