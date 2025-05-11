import { BaseQuery } from '../base';

/**
 * Parameters for UpdateLastLogin query
 */
export type UpdateLastLoginParams = {
  userId: string;
};

/**
 * Query to update a user's last login timestamp
 */
export class UpdateLastLoginQuery extends BaseQuery<UpdateLastLoginParams, void> {
  /**
   * Execute the query to update the last login timestamp
   * @param params Query parameters
   */
  async execute({ userId }: UpdateLastLoginParams): Promise<void> {
    const timestamp = new Date().toISOString();

    await this.db
      .prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(timestamp, userId)
      .run();
  }
}
