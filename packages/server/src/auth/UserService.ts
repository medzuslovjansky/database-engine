import { D1Database } from '@cloudflare/workers-types';
import { FindUserQuery, GetUserRolesQuery, CountUsersQuery } from '@app/queries';
import { User } from './User';

interface CachedUser {
  user: User;
  expiresAt: number;
}

interface UserQuery {
	userId?: string;
	email?: string;
}

/**
 * Service for managing users
 */
export class UserService {
  private static instance: UserService | null = null;

  // Two separate caches for efficient lookups
  private userCacheByEmail: Record<string, CachedUser> = {};
  private userCacheById: Record<string, CachedUser> = {};
  private cacheTtl = 5 * 60 * 1000; // 5 minutes
  private _hasAnyUsers: boolean | null = null;

  private constructor(private db: D1Database) {}

  /**
   * Get the singleton instance
   */
  public static getInstance(db?: D1Database): UserService {
    // Create instance if it doesn't exist or if a new db is provided
    if (!UserService.instance || db !== UserService.instance.db) {
      if (!db) {
        throw new Error('Database instance required for initialization');
      }

      UserService.instance = new UserService(db);
    }

    return UserService.instance;
  }

  /**
   * Get a user by ID
   */
  public async getUserById(userId: string): Promise<User | null> {
    // Check cache first
    const user = this.getCachedUserById(userId);
    if (user) return user;

    return this.findAndCacheUser({ userId });
  }

  /**
   * Get a user by email
   */
  public async getUserByEmail(email: string): Promise<User | null> {
    // Check cache first
    const user = this.getCachedUserByEmail(email);
    if (user) return user;

    return this.findAndCacheUser({ email });
  }

  /**
   * Invalidate expired users from the cache
   */
  public invalidateExpiredUsers(): void {
    const now = Date.now();

    for (const id in this.userCacheById) {
      const cachedUser = this.userCacheById[id];
      if (cachedUser.expiresAt <= now) {
        const email = cachedUser.user.email;
        delete this.userCacheByEmail[email];
        delete this.userCacheById[id];
      }
    }
  }

  /**
   * Invalidate a specific user from the cache
   * @param params Object containing user id or email to invalidate
   */
  public invalidateUser(params: { id?: string; email?: string }): void {
    const { id, email } = params;

    let cachedUser: CachedUser | undefined;

    if (id && this.userCacheById[id]) {
      cachedUser = this.userCacheById[id];
    } else if (email && this.userCacheByEmail[email]) {
      cachedUser = this.userCacheByEmail[email];
    }

    if (cachedUser) {
      delete this.userCacheById[cachedUser.user.id];
      delete this.userCacheByEmail[cachedUser.user.email];
    }

    this._hasAnyUsers = true; // Once a user is invalidated, we know at least one user exists
  }

  public getCachedUserByEmail(email: string): User | null {
    const cached = this.userCacheByEmail[email];
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }
    return null;
  }

  public getCachedUserById(userId: string): User | null {
    const cached = this.userCacheById[userId];
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }
    return null;
  }

  private cacheUser(user: User): void {
    const expiresAt = Date.now() + this.cacheTtl;
    const cachedUser: CachedUser = { user, expiresAt };

    // Store in both caches
    this.userCacheByEmail[user.email] = cachedUser;
    this.userCacheById[user.id] = cachedUser;
  }

  /**
   * Find a user by ID or email and cache the result
   * @private
   */
  private async findAndCacheUser(params: { userId?: string; email?: string }): Promise<User | null> {
    // Use FindUserQuery to find the user
    const findUserQuery = new FindUserQuery(this.db);
    const result = await findUserQuery.execute(params);

    if (!result) return null;

    // Get user roles
    const getUserRolesQuery = new GetUserRolesQuery(this.db);
    const roles = await getUserRolesQuery.execute({ userId: result.id as string });

    // Create domain User object
    const user = User.fromSchemaUser(result, roles);

    // Cache the user in both caches
    this.cacheUser(user);

    return user;
  }

  /**
   * Check if there are any users in the system (flag is set after first check)
   */
  public async hasAnyUsers(): Promise<boolean> {
    if (this._hasAnyUsers !== null) {
      return this._hasAnyUsers;
    }
    const countQuery = new CountUsersQuery(this.db);
    const count = await countQuery.execute();
    this._hasAnyUsers = count > 0;
    return this._hasAnyUsers;
  }
}
