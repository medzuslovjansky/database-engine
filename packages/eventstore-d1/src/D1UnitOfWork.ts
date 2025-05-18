import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';

export interface D1UnitOfWorkOptions {
  db: D1Database;
}

/**
 * A low-level utility to batch D1PreparedStatements for execution.
 * This is D1-specific and not the main UnitOfWork for the application domain.
 */
export class D1UnitOfWork {
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
    if (this.statements.length === 0) {
      return;
    }
    try {
      // D1Result from batch is an array of D1Result per statement
      await this.db.batch(this.statements);
    } finally {
      this.statements = []; // Clear statements regardless of success or failure
    }
  }

  getPendingStatementCount(): number {
    return this.statements.length;
  }

  clear(): void {
    this.statements = [];
  }
}
