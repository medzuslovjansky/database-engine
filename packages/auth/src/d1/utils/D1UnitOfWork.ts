import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import type { UnitOfWork } from '@auth/core';

export interface D1UnitOfWorkOptions {
  db: D1Database;
}

/**
 * A low-level utility to batch D1PreparedStatements for execution.
 * This is D1-specific and focused on auth operations.
 */
export class D1UnitOfWork implements UnitOfWork {
  private readonly db: D1Database;
  private statements: D1PreparedStatement[] = [];

  constructor(options: Readonly<D1UnitOfWorkOptions>) {
    this.db = options.db;
  }

  addStatement(statement: D1PreparedStatement): void {
    this.statements.push(statement);
  }

  addStatements(statements: D1PreparedStatement[]): void {
    this.statements.push(...statements);
  }

  async commit(): Promise<void> {
    const statements = this.statements.splice(0);
    if (statements.length === 0) {
      return;
    }

    await this.db.batch(statements);
  }

  getPendingStatementCount(): number {
    return this.statements.length;
  }

  clear(): void {
    this.statements = [];
  }
}
