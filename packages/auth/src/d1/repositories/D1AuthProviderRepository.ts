import type { D1Database } from '@cloudflare/workers-types';
import type { AuthProviderLinkDTO, AuthProviderType } from '@auth/schema';
import type { AuthProviderLinkRepository, DateTimeProvider } from '@auth/core';

import type { D1UnitOfWork } from '../D1UnitOfWork';

export interface D1AuthProviderRepositoryConfig {
  db: D1Database;
  tableName: string;
  unitOfWork: D1UnitOfWork;
  dateTimeProvider: DateTimeProvider;
}

export class D1AuthProviderLinkRepository implements AuthProviderLinkRepository {
  constructor(private readonly config: D1AuthProviderRepositoryConfig) {}

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

  async link(providerType: AuthProviderType, providerId: string, userId: string): Promise<void> {
    const query = `INSERT INTO ${this.config.tableName} \
      (provider_type, provider_id, user_id, created_at, last_login_at) VALUES (?1, ?2, ?3, ?4, ?5)`;
    const statement = this.config.db.prepare(query).bind(
      providerType,
      providerId,
      userId,
      this.config.dateTimeProvider.nowUnix(),
      this.config.dateTimeProvider.nowUnix()
    );
    this.config.unitOfWork.addStatement(statement);
  }

  async loginByProviderId(providerType: AuthProviderType, providerId: string): Promise<string> {
    const userId = await this.findUserIdByProviderId(providerType, providerId);
      // TODO: touch last login at
    if (!userId) {
      throw new Error('User not found');
    }

    return userId;
  }

  async unlink(providerType: AuthProviderType, providerId: string): Promise<void> {
    const query = `DELETE FROM ${this.config.tableName} \
      WHERE provider_type = ?1 AND provider_id = ?2`;
    const statement = this.config.db.prepare(query).bind(providerType, providerId);
    this.config.unitOfWork.addStatement(statement);
  }

  async deleteByProviderId(providerType: AuthProviderType, providerId: string): Promise<void> {
    await this.unlink(providerType, providerId);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const query = `DELETE FROM ${this.config.tableName} WHERE user_id = ?1`;
    const statement = this.config.db.prepare(query).bind(userId);
    this.config.unitOfWork.addStatement(statement);
  }
}
