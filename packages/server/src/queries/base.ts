/**
 * Base query interfaces and abstract classes
 */

/**
 * Interface for a database query
 */
export interface IQuery<TParams, TResult> {
  /**
   * Execute the query with the given parameters
   * @param params Query parameters
   * @returns Query result
   */
  execute(params: TParams): Promise<TResult>;
}

/**
 * Abstract base class for database queries
 */
export abstract class BaseQuery<TParams, TResult> implements IQuery<TParams, TResult> {
  protected db: D1Database;

  /**
   * Create a new query instance
   * @param db D1 database instance
   */
  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Execute the query with the given parameters
   * @param params Query parameters
   * @returns Query result
   */
  abstract execute(params: TParams): Promise<TResult>;
}
