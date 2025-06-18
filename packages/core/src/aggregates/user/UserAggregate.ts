import {
  AggregateRoot,
  StreamIdentifier
} from '@interslavic/database-engine-eventstore';
import type {UserRole} from '@core/primitives';

import type {UserEvent} from './events';

export interface UserState {
  id: string;
  roles: Set<string>;
}

function defaultUserState(userId: string): UserState {
  return {
    id: userId,
    roles: new Set<string>()
  };
}

export class UserAggregate extends AggregateRoot<UserState, UserEvent> {
  constructor(userId: string, revision = 0, state: UserState = defaultUserState(userId)) {
    super(
      StreamIdentifier.fromString(`users/${userId}`),
      revision,
      state
    );
  }

  protected doApply(event: UserEvent): void {
    switch (event.type) {
      case 'UserCreated': {
        this.state.id = event.data.user_id;
        break;
      }
      case 'RoleAssigned': {
        const key = this.#toKey(event.data.role, event.data.language);
        this.state.roles.add(key);
        break;
      }
      case 'RoleUnassigned': {
        const key = this.#toKey(event.data.role, event.data.language);
        this.state.roles.delete(key);
        break;
      }
    }
  }

  // --- Business methods that raise events ---
  public initializeUser(): void {
    if (this.revision > 0) {
      throw new Error('User already initialized. Cannot call initializeUser again.');
    }

    this.raise('UserCreated', { user_id: this.state.id });
  }

  public assignRole(issuerId: string, role: UserRole, language?: string): void {
    const key = this.#toKey(role, language);

    if (this.state.roles.has(key)) {
      throw new Error(`Cannot assign "${key}" role again.`);
    }

    this.raise('RoleAssigned', {
      issuer_id: issuerId,
      user_id: this.state.id,
      role,
      language,
    });
  }

  public unassignRole(issuerId: string, role: UserRole, language?: string): void {
    const key = this.#toKey(role, language);
    if (!this.state.roles.has(role)) {
      throw new Error(`Could not find role "${key}" to unassign.`);
    }

    if (this.state.roles.has('admin') && role !== 'admin') {
      throw new Error(`Cannot unassign "${role}" role from admin.`);
    }

    this.raise('RoleUnassigned', {
      issuer_id: issuerId,
      user_id: this.state.id,
      role,
      language,
    });
  }

  // --- Permission-checking methods (queries on current state) ---
  public hasRole(role: UserRole, language?: string): boolean {
    if (this.state.roles.has('admin')) {
      return true;
    }

    if (role === 'editor' && this.hasRole('speaker', language)) {
      return true;
    }

    const key = this.#toKey(role, language);
    return this.state.roles.has(role) || this.state.roles.has(key);
  }

  public canManageRole(role: UserRole, language?: string): boolean {
    if (role === 'speaker' && !language) {
      return false;
    }

    if (this.hasRole('admin')) {
      return true;
    }

    if (role === 'speaker') {
      return this.hasRole('curator', language);
    }

    return false;
  }

  toJSON() {
    return {
      ...this.state,
      roles: [...this.state.roles],
    };
  }

  static parseSnapshotData(data: string): UserState {
    const parsedData = JSON.parse(data);
    return {
      ...parsedData,
      roles: new Set(parsedData.roles),
    };
  }

  #toKey(role: UserRole, language?: string): string {
    return language ? `${role}:${language}` : role;
  }

  // Static factory method for aggregate registry
  static factory(streamId: StreamIdentifier, revision: number, state?: UserState): UserAggregate {
    return new UserAggregate(streamId.id, revision, state);
  }
}
