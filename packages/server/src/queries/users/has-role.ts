import { BaseQuery } from '../base';

/**
 * Parameters for HasRole query
 */
export type HasRoleParams = {
  userId: string;
  roleId: string;
  languageCode?: string;
};

/**
 * Query to check if a user has a specific role
 */
export class HasRoleQuery extends BaseQuery<HasRoleParams, boolean> {
  /**
   * Execute the query to check if a user has a specific role
   * @param params Query parameters
   * @returns True if the user has the role, false otherwise
   */
  async execute({ userId, roleId, languageCode }: HasRoleParams): Promise<boolean> {
    const query = languageCode
      ? 'SELECT 1 FROM user_roles WHERE user_id = ? AND role_id = ? AND language_code = ?'
      : 'SELECT 1 FROM user_roles WHERE user_id = ? AND role_id = ?';

    const params = languageCode
      ? [userId, roleId, languageCode]
      : [userId, roleId];

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .first<{1: number}>();

    return result !== null;
  }
}
