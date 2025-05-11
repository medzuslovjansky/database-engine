import { BaseQuery } from '../base';
import { UserRole } from '../../schema/system/user-role';

/**
 * Parameters for GetUserRoles query
 */
export type GetUserRolesParams = {
  userId: string;
};

/**
 * Query to get all roles for a user
 */
export class GetUserRolesQuery extends BaseQuery<GetUserRolesParams, UserRole[]> {
  /**
   * Execute the query to get all roles for a user
   * @param params Query parameters
   * @returns Array of user roles
   */
  async execute({ userId }: GetUserRolesParams): Promise<UserRole[]> {
    const results = await this.db
      .prepare('SELECT * FROM user_roles WHERE user_id = ?')
      .bind(userId)
      .all<UserRole>();

    return results.results;
  }
}
