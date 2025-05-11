import { Role } from "./Role";
import { UserRole } from "./UserRole";

/**
 * User domain model with role-based access control functionality
 */
export class User {
  constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _displayName: string,
    private readonly _roles: UserRole[] = []
  ) {}

  get id(): string {
    return this._id;
  }

  get displayName(): string {
    return this._displayName;
  }

  get email(): string {
    return this._email;
  }

  get roles(): UserRole[] {
    return this._roles;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: Role, languageCode?: string): boolean {
    return this._roles.some(r => r.matches(role, languageCode));
  }

  toJSON() {
	return {
		id: this._id,
		displayName: this._displayName,
		email: this._email,
		roles: this._roles.map(r => r.toJSON()),
	};
  }

  /**
   * Creates a User domain model from database schema objects
   *
   * @param dbUser Database user object (from schema/system/user)
   * @param dbRoles Array of database role objects (from schema/system/user-role)
   * @returns A new User domain model
   */
  static fromSchemaUser(dbUser: any, dbRoles: any[] = []): User {
    // Convert DB roles to domain UserRole objects
    const roles = dbRoles.map(dbRole =>
      new UserRole(dbRole.role_id as Role, dbRole.language_code)
    );

    // Create a new domain User with converted data
    return new User(
      dbUser.id as string,
      dbUser.email as string,
      dbUser.display_name as string, // Using display_name as displayName
      roles
    );
  }
}
