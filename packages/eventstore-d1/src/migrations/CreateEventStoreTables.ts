import type { D1Database } from '@cloudflare/workers-types';
import type { D1MigrationDefinition } from '@interslavic/database-engine-db-d1';

export class CreateEventStoreTables implements D1MigrationDefinition {
  name = 'create_eventstore_tables_001';

  async up(db: D1Database): Promise<void> {
    // Create Events table
    await db.exec('CREATE TABLE IF NOT EXISTS Events (\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
stream TEXT NOT NULL,\
revision INTEGER NOT NULL,\
type TEXT NOT NULL,\
ts INTEGER NOT NULL,\
data TEXT,\
UNIQUE (stream, revision)\
);');

    // Create indices for Events table
    await db.exec('CREATE INDEX IF NOT EXISTS idx_events_stream ON Events(stream);');
    await db.exec('CREATE INDEX IF NOT EXISTS idx_events_stream_revision ON Events(stream, revision);');
    await db.exec('CREATE INDEX IF NOT EXISTS idx_events_id ON Events(id);');

    // Create Snapshots table
    await db.exec('CREATE TABLE IF NOT EXISTS Snapshots (\
stream TEXT PRIMARY KEY,\
revision INTEGER NOT NULL,\
ts INTEGER NOT NULL,\
data TEXT NOT NULL\
);');

    // Create indices for Snapshots table
    await db.exec('CREATE INDEX IF NOT EXISTS idx_snapshots_stream ON Snapshots(stream);');
    await db.exec('CREATE INDEX IF NOT EXISTS idx_snapshots_revision ON Snapshots(stream, revision);');
  }

  async down(db: D1Database): Promise<void> {
    // Drop tables in reverse order
    await db.exec('DROP TABLE IF EXISTS Snapshots;');
    await db.exec('DROP TABLE IF EXISTS Events;');
  }
}
