import type { D1Database } from '@cloudflare/workers-types';

import type { D1MigrationDefinition } from './types';

export const CreateAuthTables: D1MigrationDefinition = {
  name: '001_create_auth_tables',
  async up(db: D1Database): Promise<void> {
    // Create user_profiles table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        avatar_url TEXT,
        email TEXT,
        last_login_at INTEGER
      );
    `);

    // Create auth_providers table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS auth_providers (
        provider_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_login_at INTEGER,
        PRIMARY KEY(provider_id, provider_type),
        FOREIGN KEY(user_id) REFERENCES user_profiles(id)
      );
    `);

    // Create pat_tokens table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pat_tokens (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        FOREIGN KEY(id) REFERENCES auth_providers(provider_id)
      );
    `);

    // Create indices for optimal query performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON auth_providers(user_id);
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_auth_providers_provider ON auth_providers(provider_type, provider_id);
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pat_tokens_name ON pat_tokens(name);
    `);
  },

  async down(db: D1Database): Promise<void> {
    await db.exec(`
      DROP TABLE IF EXISTS pat_tokens;
      DROP TABLE IF EXISTS auth_providers;
      DROP TABLE IF EXISTS user_profiles;
    `);
  },
};
