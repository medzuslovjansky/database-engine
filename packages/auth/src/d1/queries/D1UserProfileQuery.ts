import type { D1Database } from '@cloudflare/workers-types';
import type { UserProfileQuery } from '@auth/core';
import type { UserProfileDTO } from '@auth/schema';

export interface D1UserProfileQueryConfig {
  db: D1Database;
  tableName: string;
}

export class D1UserProfileQuery implements UserProfileQuery {
  constructor(private readonly config: D1UserProfileQueryConfig) {}

  async findById(id: string): Promise<UserProfileDTO | null> {
    const query = `SELECT id, display_name, avatar_url, email, last_login_at \
      FROM ${this.config.tableName} WHERE id = ?1`;

    const result = await this.config.db.prepare(query)
      .bind(id)
      .first() as { id: string; display_name?: string; avatar_url?: string; email?: string; last_login_at?: number } | null;

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      display_name: result.display_name,
      avatar_url: result.avatar_url,
      email: result.email,
      last_login_at: result.last_login_at,
      provider_link: undefined // Will be populated by higher-level services if needed
    };
  }
}
