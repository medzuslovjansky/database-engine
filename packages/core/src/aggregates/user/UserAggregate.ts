import {
  AggregateRoot,
  StreamIdentifier
} from '@interslavic/database-engine-eventstore';
import {
  DisplayNameChangedEventData,
  RoleAssignedEventData,
  RoleUnassignedEventData,
  UserCreatedEventData,
  UserEvent
} from './events';

const ADMIN_ROLE = 'admin';

export interface UserState {
  id: string;
  email: string;
  displayName: string;
  roles: Set<string>;
}

export class UserAggregate extends AggregateRoot<UserState, UserEvent> {
  constructor(userId: string) {
    super(
      StreamIdentifier.fromString(`users/${userId}`),
      0,
      {
        id: userId,
        email: '',
        displayName: '',
        roles: new Set<string>()
      }
    );
  }

  protected doApply(event: UserEvent): void {
    switch (event.type) {
      case 'UserCreated': {
        const { email, display_name, roles } = event.data;
        this.state.email = email;
        this.state.displayName = display_name;
        this.state.roles = new Set(roles);
        break;
      }
      case 'DisplayNameChanged': {
        this.state.displayName = event.data.new_display_name;
        break;
      }
      case 'RoleAssigned': {
        this.state.roles.add(event.data.role);
        break;
      }
      case 'RoleUnassigned': {
        this.state.roles.delete(event.data.role);
        break;
      }
    }
  }

  // --- Business methods that raise events ---
  public initializeUser(email: string, displayName: string, initialRoles: string[] = []): void {
    if (this.revision > 0) {
      throw new Error('User already initialized. Cannot call initializeUser again.');
    }
    const eventData: UserCreatedEventData = {
      user_id: this.state.id,
      email,
      display_name: displayName,
      roles: initialRoles,
    };
    this.raise('UserCreated', eventData);
  }

  public changeDisplayName(newDisplayName: string): void {
    if (!newDisplayName || newDisplayName.trim() === '') {
      throw new Error('Display name cannot be empty.');
    }
    if (this.state.displayName === newDisplayName) {
      return; // No change
    }
    const eventData: DisplayNameChangedEventData = {
      user_id: this.state.id,
      new_display_name: newDisplayName,
    };
    this.raise('DisplayNameChanged', eventData);
  }

  public assignRole(role: string, issuerId: string): void {
    if (!role || role.trim() === '') {
      throw new Error('Role cannot be empty.');
    }
    if (this.state.roles.has(role)) {
      return; // Role already assigned
    }
    const eventData: RoleAssignedEventData = {
      issuer_id: issuerId,
      user_id: this.state.id,
      role,
    };
    this.raise('RoleAssigned', eventData);
  }

  public unassignRole(role: string, unassignedByUserId: string): void {
    if (!role || role.trim() === '') {
      throw new Error('Role cannot be empty.');
    }
    if (!this.state.roles.has(role)) {
      return; // Role not currently assigned
    }
    const eventData: RoleUnassignedEventData = {
      issuer_id: unassignedByUserId,
      user_id: this.state.id,
      role,
    };
    this.raise('RoleUnassigned', eventData);
  }

  // --- Permission-checking methods (queries on current state) ---
  public hasRole(role: string): boolean {
    return this.state.roles.has(role);
  }

  public canManageOtherUserRoles(): boolean {
    // Example: Only users with ADMIN_ROLE can manage other users' roles.
    return this.state.roles.has(ADMIN_ROLE);
  }
}
