import type { D1Database } from '@cloudflare/workers-types';

export interface D1MigrationDefinition {
  name: string;
  up: (db: D1Database) => Promise<void>;
  down: (db: D1Database) => Promise<void>;
}
