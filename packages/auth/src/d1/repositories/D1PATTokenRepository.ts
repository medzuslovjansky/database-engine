import type { D1Database } from '@cloudflare/workers-types';
import type { AuthProviderType } from '@auth/schema';
import type { PATTokenDetailed, PATTokenRepository } from '@auth/pat';
import type { DateTimeProvider } from '@auth/core';
import type { D1UnitOfWork } from '../D1UnitOfWork';

export interface D1PATTokenRepositoryConfig {
  readonly db: D1Database;
  readonly unitOfWork: D1UnitOfWork;
  readonly dateTimeProvider: DateTimeProvider;
  readonly tokensTableName: string;
  readonly providersTableName: string;
}

export class D1PATTokenRepository implements PATTokenRepository {
  private readonly config: D1PATTokenRepositoryConfig;

  constructor(config: Readonly<D1PATTokenRepositoryConfig>) {
    this.config = config;
  }

  async createToken(tokenId: string, name: string): Promise<void> {
    const query = `INSERT INTO ${this.config.tokensTableName} (id, name) VALUES (?1, ?2)`;
    const statement = this.config.db.prepare(query).bind(tokenId, name);
    this.config.unitOfWork.addStatement(statement);
  }

  async deleteToken(tokenId: string): Promise<void> {
    const query = `DELETE FROM ${this.config.tokensTableName} WHERE id = ?1`;
    const statement = this.config.db.prepare(query).bind(tokenId);
    this.config.unitOfWork.addStatement(statement);
  }

  async listTokens(userId: string): Promise<PATTokenDetailed[]> {
    const query = `SELECT t.id as token_id, t.name as token_name, p.provider_id, p.provider_type, \
      p.user_id, p.created_at, p.last_login_at FROM ${this.config.tokensTableName} t \
      JOIN ${this.config.providersTableName} p ON p.provider_id = t.id WHERE p.user_id = ?1`;

    const result = await this.config.db.prepare(query)
      .bind(userId)
      .all() as {
        results: Array<{
          token_id: string;
          token_name: string;
          provider_id: string;
          provider_type: AuthProviderType;
          user_id: string;
          created_at: number;
          last_login_at?: number;
        }>
      };

    return result.results.map(row => ({
      provider_type: row.provider_type,
      provider_id: row.provider_id,
      user_id: row.user_id,
      created_at: row.created_at,
      last_login_at: row.last_login_at,
      token_name: row.token_name
    }));
  }
}
