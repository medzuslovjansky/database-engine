import { BaseQuery } from '../base';
import { User } from '../../schema/system/user';

/**
 * Parameters for FindUser query - specify either email or userId
 */
export type FindUserParams = {
  email?: string;
  userId?: string;
};

/**
 * Query to find a user by email or ID
 */
export class FindUserQuery extends BaseQuery<FindUserParams, User | null> {
  /**
   * Execute the query to find a user by email or ID
   * @param params Query parameters (either email or userId)
   * @returns The user or null if not found
   */
  async execute(params: FindUserParams): Promise<User | null> {
    if (!params.email && !params.userId) {
      throw new Error('FindUserQuery requires either email or userId');
    }

    let result: User | null = null;

		const [literal, value] = params.email ? ['email', params.email] : ['id', params.userId];

    result = await this.db
      .prepare(`SELECT * FROM users WHERE ${literal} = ?`)
      .bind(value)
      .first<User>();

    return result || null;
  }
}
