import type { D1Database } from '@cloudflare/workers-types';
import type { UnitOfWork } from '@auth/core';

import type { D1UnitOfWork } from '../utils/D1UnitOfWork';

export interface D1PATTokenStagerConfig {
  db: D1Database;
  tableName: string;
  d1UnitOfWork: D1UnitOfWork;
}

export class D1PATTokenStager {
  constructor(private readonly config: D1PATTokenStagerConfig) {}

  static createFactory = (config: Omit<D1PATTokenStagerConfig, 'd1UnitOfWork'>) =>
    (uow: UnitOfWork) =>
      new D1PATTokenStager({ ...config, d1UnitOfWork: uow as D1UnitOfWork })

  registerToken(tokenId: string, name: string): void {
    const query = `INSERT INTO ${this.config.tableName} (id, provider_type, name) VALUES (?1, ?2, ?3)`;
    const statement = this.config.db.prepare(query).bind(tokenId, 'pat', name);
    this.config.d1UnitOfWork.addStatement(statement);
  }

  unregisterToken(tokenId: string): void {
    const query = `DELETE FROM ${this.config.tableName} WHERE id = ?1 AND provider_type = 'pat'`;
    const statement = this.config.db.prepare(query).bind(tokenId);
    this.config.d1UnitOfWork.addStatement(statement);
  }
}
