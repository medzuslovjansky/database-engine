import type { D1Database } from '@cloudflare/workers-types';
import type { DateTimeProvider, UnitOfWork } from '@auth/core';
import type { UserProfileDTO } from '@auth/schema';

import type { D1UnitOfWork } from '../utils/D1UnitOfWork';

export interface D1UserProfileStagerConfig {
  db: D1Database;
  tableName: string;
  d1UnitOfWork: D1UnitOfWork;
  dateTimeProvider: DateTimeProvider;
}

export class D1UserProfileStager {
  constructor(private readonly config: D1UserProfileStagerConfig) {}

    static createFactory = (config: Omit<D1UserProfileStagerConfig, 'd1UnitOfWork'>) =>
    (uow: UnitOfWork) =>
      new D1UserProfileStager({ ...config, d1UnitOfWork: uow as D1UnitOfWork })

  createUserProfile(profile: UserProfileDTO): void {
    const query = `INSERT INTO ${this.config.tableName} \
      (id, display_name, avatar_url, email, last_login_at) VALUES (?1, ?2, ?3, ?4, ?5)`;
    const statement = this.config.db.prepare(query).bind(
      profile.id,
      profile.display_name || null,
      profile.avatar_url || null,
      profile.email || null,
      profile.last_login_at || null
    );
    this.config.d1UnitOfWork.addStatement(statement);
  }

  updateUserProfile(profile: UserProfileDTO): void {
    const query = `UPDATE ${this.config.tableName} \
      SET display_name = ?2, avatar_url = ?3, email = ?4, last_login_at = ?5 WHERE id = ?1`;
    const statement = this.config.db.prepare(query).bind(
      profile.id,
      profile.display_name || null,
      profile.avatar_url || null,
      profile.email || null,
      profile.last_login_at || null
    );
    this.config.d1UnitOfWork.addStatement(statement);
  }

  removeUserProfile(id: string): void {
    const query = `DELETE FROM ${this.config.tableName} WHERE id = ?1`;
    const statement = this.config.db.prepare(query).bind(id);
    this.config.d1UnitOfWork.addStatement(statement);
  }
}
