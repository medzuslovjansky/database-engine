import type { D1Database } from '@cloudflare/workers-types';

import { AUTH_PROVIDERS_TABLE_NAME, PAT_TOKENS_TABLE_NAME, USER_PROFILES_TABLE_NAME } from '../consts';

import type { D1MigrationDefinition } from './types';

export const CreateAuthTables: D1MigrationDefinition = {
  name: '001_create_auth_tables',
  async up(db: D1Database): Promise<void> {
    // Create user_profiles table
    await db.exec(`CREATE TABLE IF NOT EXISTS ${USER_PROFILES_TABLE_NAME} (\
      id TEXT PRIMARY KEY,\
      display_name TEXT,\
      avatar_url TEXT,\
      email TEXT,\
      last_login_at INTEGER\
    );`);

    // Create auth_providers table
    await db.exec(`CREATE TABLE IF NOT EXISTS ${AUTH_PROVIDERS_TABLE_NAME} (\
      provider_id TEXT NOT NULL,\
      provider_type TEXT NOT NULL,\
      user_id TEXT NOT NULL,\
      created_at INTEGER NOT NULL,\
      last_login_at INTEGER,\
      PRIMARY KEY(provider_id, provider_type),\
      FOREIGN KEY(user_id) REFERENCES ${USER_PROFILES_TABLE_NAME}(id)\
    );`);

    // Create pat_tokens table
    await db.exec(`CREATE TABLE IF NOT EXISTS ${PAT_TOKENS_TABLE_NAME} (\
      id TEXT PRIMARY KEY,\
      name TEXT NOT NULL,\
      provider_type TEXT NOT NULL DEFAULT 'pat',\
      FOREIGN KEY(id, provider_type) REFERENCES ${AUTH_PROVIDERS_TABLE_NAME}(provider_id, provider_type) ON DELETE CASCADE\
    );`);

    // Create indices for optimal query performance
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON ${AUTH_PROVIDERS_TABLE_NAME}(user_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_auth_providers_provider ON ${AUTH_PROVIDERS_TABLE_NAME}(provider_type, provider_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_pat_tokens_name ON ${PAT_TOKENS_TABLE_NAME}(name);`);
  },

  async down(db: D1Database): Promise<void> {
    await db.exec(`DROP TABLE IF EXISTS ${PAT_TOKENS_TABLE_NAME};`);
    await db.exec(`DROP TABLE IF EXISTS ${AUTH_PROVIDERS_TABLE_NAME};`);
    await db.exec(`DROP TABLE IF EXISTS ${USER_PROFILES_TABLE_NAME};`);
  },
};
