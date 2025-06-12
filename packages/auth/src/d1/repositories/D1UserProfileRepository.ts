import type { D1Database } from '@cloudflare/workers-types';
import type { UserProfileRepository, DateTimeProvider } from '@auth/core';
import type { UserProfileDTO } from '@auth/schema';

import type { D1UnitOfWork } from '../D1UnitOfWork';

export interface D1UserProfileRepositoryConfig {
  db: D1Database;
  tableName: string;
  unitOfWork: D1UnitOfWork;
  dateTimeProvider: DateTimeProvider;
}

export class D1UserProfileRepository implements UserProfileRepository {
  constructor(private readonly config: D1UserProfileRepositoryConfig) {}

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
      last_login_at: result.last_login_at ? this.config.dateTimeProvider.fromUnix(result.last_login_at) : undefined,
      provider_link: undefined // Will be populated by higher-level services if needed
    };
  }

  async create(profile: UserProfileDTO): Promise<void> {
    const query = `INSERT INTO ${this.config.tableName} \
      (id, display_name, avatar_url, email, last_login_at) VALUES (?1, ?2, ?3, ?4, ?5)`;
    const statement = this.config.db.prepare(query).bind(
      profile.id,
      profile.display_name || null,
      profile.avatar_url || null,
      profile.email || null,
      profile.last_login_at ? this.config.dateTimeProvider.toUnix(profile.last_login_at) : null
    );
    this.config.unitOfWork.addStatement(statement);
  }

  async update(profile: UserProfileDTO): Promise<void> {
    const query = `UPDATE ${this.config.tableName} \
      SET display_name = ?2, avatar_url = ?3, email = ?4, last_login_at = ?5 WHERE id = ?1`;
    const statement = this.config.db.prepare(query).bind(
      profile.id,
      profile.display_name || null,
      profile.avatar_url || null,
      profile.email || null,
      profile.last_login_at ? this.config.dateTimeProvider.toUnix(profile.last_login_at) : null
    );
    this.config.unitOfWork.addStatement(statement);
  }

  async remove(id: string): Promise<void> {
    const query = `DELETE FROM ${this.config.tableName} WHERE id = ?1`;
    const statement = this.config.db.prepare(query).bind(id);
    this.config.unitOfWork.addStatement(statement);
  }
}
