import type { D1Database } from '@cloudflare/workers-types';
import type { AuthProviderLinkDTO, AuthProviderType } from '@auth/schema';
import type { AuthProviderLinkQuery } from '@auth/core';

export interface D1AuthProviderLinkQueryConfig {
  db: D1Database;
  tableName: string;
}

export class D1AuthProviderLinkQuery implements AuthProviderLinkQuery {
  constructor(private readonly config: D1AuthProviderLinkQueryConfig) {}

  async findUserIdByProviderId(providerType: AuthProviderType, providerId: string): Promise<string | null> {
    const query = `SELECT user_id FROM ${this.config.tableName} \
      WHERE provider_type = ?1 AND provider_id = ?2`;

    const result = await this.config.db.prepare(query)
      .bind(providerType, providerId)
      .first() as { user_id: string } | null;

    return result?.user_id || null;
  }

  async findLinksByUserId(userId: string): Promise<AuthProviderLinkDTO[]> {
    const query = `SELECT * FROM ${this.config.tableName} WHERE user_id = ?1`;

    const results = await this.config.db.prepare(query)
      .bind(userId)
      .all() as { results: AuthProviderLinkDTO[] };

    return results.results;
  }
}
