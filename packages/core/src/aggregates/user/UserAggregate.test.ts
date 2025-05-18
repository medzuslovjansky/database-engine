import type {
  UserCreatedEvent,
  DisplayNameChangedEvent,
  RoleAssignedEvent,
  RoleUnassignedEvent,
} from './events';
import { UserAggregate } from './UserAggregate';

const ADMIN_ROLE = 'admin';
const EDITOR_ROLE = 'editor';

describe('UserAggregate', () => {
  const userId = 'test-user-id-123';
  const userEmail = 'test@example.com';
  const initialDisplayName = 'Initial Name';
  const actorUserId = 'actor-user-id-456';

  let aggregate: UserAggregate;

  beforeEach(() => {
    aggregate = new UserAggregate(userId);
    aggregate.initializeUser(userEmail, initialDisplayName, [EDITOR_ROLE]);
    aggregate.pullEvents(); // Clear the UserCreated event for each test
  });

  it('should initialize a user and raise UserCreated event', () => {
    const freshAggregate = new UserAggregate(userId);
    freshAggregate.initializeUser(userEmail, initialDisplayName, [EDITOR_ROLE]);
    const events = freshAggregate.pullEvents();
    expect(events).toHaveLength(1);
    const event = events[0] as UserCreatedEvent;
    expect(event.type).toBe('UserCreated');
    expect(event.data.user_id).toBe(userId);
    expect(event.data.email).toBe(userEmail);
    expect(event.data.display_name).toBe(initialDisplayName);
    expect(event.data.roles).toEqual([EDITOR_ROLE]);
    expect(event.stream.toString()).toBe(`users/${userId}`);
    expect(event.revision).toBe(1);
  });

  it('should throw an error if initializing an already initialized user', () => {
    expect(() =>
      aggregate.initializeUser('new@example.com', 'New Name'),
    ).toThrow('User already initialized. Cannot call initializeUser again.');
  });

  describe('after user is initialized', () => {
    it('should change display name and raise DisplayNameChanged event', () => {
      const newDisplayName = 'Updated Name';
      aggregate.changeDisplayName(newDisplayName);
      expect(aggregate.state.displayName).toBe(newDisplayName);
      expect(aggregate.revision).toBe(2); // Initial + change
      const events = aggregate.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as DisplayNameChangedEvent;
      expect(event.type).toBe('DisplayNameChanged');
      expect(event.data.user_id).toBe(userId);
      expect(event.data.new_display_name).toBe(newDisplayName);
      expect(event.revision).toBe(2);
    });

    it('should not raise event if display name is unchanged', () => {
      aggregate.changeDisplayName(initialDisplayName);
      expect(aggregate.pullEvents()).toHaveLength(0);
      expect(aggregate.revision).toBe(1);
    });

    it('should throw error if display name is empty', () => {
      expect(() => aggregate.changeDisplayName('')).toThrow(
        'Display name cannot be empty.',
      );
    });

    it('should assign a new role and raise RoleAssigned event', () => {
      aggregate.assignRole(ADMIN_ROLE, actorUserId);
      expect(aggregate.state.roles.has(ADMIN_ROLE)).toBe(true);
      expect(aggregate.revision).toBe(2);
      const events = aggregate.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as RoleAssignedEvent;
      expect(event.type).toBe('RoleAssigned');
      expect(event.data.user_id).toBe(userId);
      expect(event.data.role).toBe(ADMIN_ROLE);
      expect(event.data.issuer_id).toBe(actorUserId);
      expect(event.revision).toBe(2);
    });

    it('should not raise event if assigning an existing role', () => {
      aggregate.assignRole(EDITOR_ROLE, actorUserId); // Already has editor
      expect(aggregate.pullEvents()).toHaveLength(0);
      expect(aggregate.revision).toBe(1);
    });

    it('should throw error if assigning an empty role', () => {
      expect(() => aggregate.assignRole('', actorUserId)).toThrow(
        'Role cannot be empty.',
      );
    });

    it('should unassign an existing role and raise RoleUnassigned event', () => {
      aggregate.unassignRole(EDITOR_ROLE, actorUserId);
      expect(aggregate.state.roles.has(EDITOR_ROLE)).toBe(false);
      expect(aggregate.revision).toBe(2);
      const events = aggregate.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as RoleUnassignedEvent;
      expect(event.type).toBe('RoleUnassigned');
      expect(event.data.user_id).toBe(userId);
      expect(event.data.role).toBe(EDITOR_ROLE);
      expect(event.data.issuer_id).toBe(actorUserId);
      expect(event.revision).toBe(2);
    });

    it('should not raise event if unassigning a non-existing role', () => {
      aggregate.unassignRole(ADMIN_ROLE, actorUserId); // Does not have admin
      expect(aggregate.pullEvents()).toHaveLength(0);
      expect(aggregate.revision).toBe(1);
    });

    it('should throw error if unassigning an empty role', () => {
      expect(() => aggregate.unassignRole('', actorUserId)).toThrow(
        'Role cannot be empty.',
      );
    });

    it('should correctly check if user has a role', () => {
      expect(aggregate.hasRole(EDITOR_ROLE)).toBe(true);
      expect(aggregate.hasRole(ADMIN_ROLE)).toBe(false);
    });

    it('canManageOtherUserRoles should be true if user has ADMIN_ROLE', () => {
      aggregate.assignRole(ADMIN_ROLE, actorUserId);
      expect(aggregate.canManageOtherUserRoles()).toBe(true);
    });

    it('canManageOtherUserRoles should be false if user does not have ADMIN_ROLE', () => {
      expect(aggregate.canManageOtherUserRoles()).toBe(false);
    });
  });

  // The following tests are removed or commented out because the new aggregate API
  // does not support direct event replay or apply, and EventEnvelope is gone.
  //
  // it('should load from history and reconstruct state', () => { ... });
  // it('apply should throw error for event with mismatched userId', () => { ... });
  // it('apply should throw error for unknown event type', () => { ... });
});
