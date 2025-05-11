import { D1Database } from '@cloudflare/workers-types';
import { User } from '../../schema/system/user';
import { UserRole } from '../../schema/system/user-role';

export class UserQueries {
  constructor(private db: D1Database) {}

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();

    return result || null;
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const results = await this.db
      .prepare('SELECT * FROM user_roles WHERE user_id = ?')
      .bind(userId)
      .all<UserRole>();

    return results.results;
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, roleId: string, languageCode?: string): Promise<boolean> {
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

  /**
   * Check if user is an admin (can do anything)
   */
  async isAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'admin');
  }

  /**
   * Check if user is a language curator for a specific language
   */
  async isLanguageCurator(userId: string, languageCode: string): Promise<boolean> {
    return this.hasRole(userId, 'language_curator', languageCode);
  }

  /**
   * Check if user can assign roles for a specific language
   * (either admin or language curator for that language)
   */
  async canAssignRoles(userId: string, languageCode: string): Promise<boolean> {
    const isUserAdmin = await this.isAdmin(userId);
    if (isUserAdmin) return true;

    return this.isLanguageCurator(userId, languageCode);
  }

  /**
   * Assign a role to a user
   */
  async assignRole(userId: string, roleId: string, languageCode: string = 'mul'): Promise<void> {
    // Check if the role assignment already exists
    const exists = await this.db
      .prepare('SELECT 1 FROM user_roles WHERE user_id = ? AND role_id = ? AND language_code = ?')
      .bind(userId, roleId, languageCode)
      .first<{1: number}>();

    if (!exists) {
      await this.db
        .prepare('INSERT INTO user_roles (user_id, role_id, language_code) VALUES (?, ?, ?)')
        .bind(userId, roleId, languageCode)
        .run();
    }
  }

  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, roleId: string, languageCode: string = 'mul'): Promise<void> {
    await this.db
      .prepare('DELETE FROM user_roles WHERE user_id = ? AND role_id = ? AND language_code = ?')
      .bind(userId, roleId, languageCode)
      .run();
  }
}
