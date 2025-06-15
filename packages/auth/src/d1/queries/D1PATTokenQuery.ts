import type { D1Database } from '@cloudflare/workers-types';
import type { AuthProviderType } from '@auth/schema';
import type { PATTokenDetailed, PATTokenQuery } from '@auth/pat';

interface PATTokenQueryResult {
  token_name: string;
  provider_id: string;
  provider_type: AuthProviderType;
  user_id: string;
  created_at: number;
  last_login_at?: number;
}

export interface D1PATTokenQueryConfig {
  readonly db: D1Database;
  readonly tokensTableName: string;
  readonly providersTableName: string;
}

export class D1PATTokenQuery implements PATTokenQuery {
  private readonly config: D1PATTokenQueryConfig;

  constructor(config: Readonly<D1PATTokenQueryConfig>) {
    this.config = config;
  }

  async listTokens(userId: string): Promise<PATTokenDetailed[]> {
    const query = `SELECT t.name as token_name, p.provider_id, p.provider_type, \
      p.user_id, p.created_at, p.last_login_at FROM ${this.config.tokensTableName} t \
      JOIN ${this.config.providersTableName} p ON p.provider_id = t.id AND p.provider_type = t.provider_type WHERE p.user_id = ?1`;

    const result = await this.config.db.prepare(query)
      .bind(userId)
      .all<PATTokenQueryResult>();

    return result.results;
  }
}
