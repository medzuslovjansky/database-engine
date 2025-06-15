import type { D1Database } from '@cloudflare/workers-types';
import type { DateTimeProvider, UnitOfWork } from '@auth/core';
import type { AuthProviderType } from '@auth/schema';

import type { D1UnitOfWork } from '../utils/D1UnitOfWork';

export interface D1AuthProviderLinkStagerConfig {
  db: D1Database;
  tableName: string;
  d1UnitOfWork: D1UnitOfWork;
  dateTimeProvider: DateTimeProvider;
}

export class D1AuthProviderLinkStager {
  constructor(private readonly config: D1AuthProviderLinkStagerConfig) {}

    static createFactory = (config: Omit<D1AuthProviderLinkStagerConfig, 'd1UnitOfWork'>) =>
    (uow: UnitOfWork) =>
      new D1AuthProviderLinkStager({ ...config, d1UnitOfWork: uow as D1UnitOfWork })

  linkAuthProvider(providerType: AuthProviderType, providerId: string, userId: string): void {
    const query = `INSERT INTO ${this.config.tableName} \
      (provider_type, provider_id, user_id, created_at, last_login_at) VALUES (?1, ?2, ?3, ?4, ?5)`;
    const statement = this.config.db.prepare(query).bind(
      providerType,
      providerId,
      userId,
      this.config.dateTimeProvider.nowUnix(),
      this.config.dateTimeProvider.nowUnix()
    );
    this.config.d1UnitOfWork.addStatement(statement);
  }

  unlinkAuthProvider(providerType: AuthProviderType, providerId: string): void {
    const query = `DELETE FROM ${this.config.tableName} \
      WHERE provider_type = ?1 AND provider_id = ?2`;
    const statement = this.config.db.prepare(query).bind(providerType, providerId);
    this.config.d1UnitOfWork.addStatement(statement);
  }

  updateLastLogin(providerType: AuthProviderType, providerId: string): void {
    const query = `UPDATE ${this.config.tableName} \
      SET last_login_at = ?1 \
      WHERE provider_type = ?2 AND provider_id = ?3`;
    const statement = this.config.db.prepare(query).bind(
      this.config.dateTimeProvider.nowUnix(),
      providerType,
      providerId
    );
    this.config.d1UnitOfWork.addStatement(statement);
  }

  deleteAuthProviderLinksByProviderId(providerType: AuthProviderType, providerId: string): void {
    this.unlinkAuthProvider(providerType, providerId);
  }

  deleteAuthProviderLinksByUserId(userId: string): void {
    const query = `DELETE FROM ${this.config.tableName} WHERE user_id = ?1`;
    const statement = this.config.db.prepare(query).bind(userId);
    this.config.d1UnitOfWork.addStatement(statement);
  }
}
