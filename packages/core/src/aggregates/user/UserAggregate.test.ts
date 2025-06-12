import type {
  UserCreatedEvent,
  RoleAssignedEvent,
  RoleUnassignedEvent,
} from './events';
import { UserAggregate } from './UserAggregate';

const ADMIN_ROLE = 'admin';
const EDITOR_ROLE = 'editor';

describe('UserAggregate', () => {
  const actorUserId = 'admin';
  const userId = 'user';

  let aggregate: UserAggregate;

  beforeEach(() => {
    aggregate = new UserAggregate(userId);
    aggregate.initializeUser();
    aggregate.pullEvents(); // Clear the UserCreated event for each test
  });

  it('should initialize a user and raise UserCreated event', () => {
    const freshAggregate = new UserAggregate(userId);
    freshAggregate.initializeUser();
    const events = freshAggregate.pullEvents();
    expect(events).toHaveLength(1);
    const event = events[0] as UserCreatedEvent;
    expect(event.type).toBe('UserCreated');
    expect(event.data.user_id).toBe(userId);
    expect(event.stream.toString()).toBe(`users/${userId}`);
    expect(event.revision).toBe(1);
  });

  it('should throw an error if initializing an already initialized user', () => {
    expect(() => aggregate.initializeUser()).toThrow('User already initialized. Cannot call initializeUser again.');
  });

  describe('after user is initialized', () => {
    it('should assign a new role and raise RoleAssigned event', () => {
      aggregate.assignRole(actorUserId, ADMIN_ROLE);
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

    it('should unassign an existing role and raise RoleUnassigned event', () => {
      aggregate.assignRole(actorUserId, EDITOR_ROLE);
      aggregate.pullEvents();

      aggregate.unassignRole(actorUserId, EDITOR_ROLE);
      expect(aggregate.state.roles.has(EDITOR_ROLE)).toBe(false);
      expect(aggregate.revision).toBe(3);
      const events = aggregate.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as RoleUnassignedEvent;
      expect(event.type).toBe('RoleUnassigned');
      expect(event.data.user_id).toBe(userId);
      expect(event.data.role).toBe(EDITOR_ROLE);
      expect(event.data.issuer_id).toBe(actorUserId);
      expect(event.revision).toBe(3);
    });

    it('should throw an error if unassigning a non-existing role', () => {
      expect(() => aggregate.unassignRole(ADMIN_ROLE, actorUserId)).toThrow(
        `Could not find role "${ADMIN_ROLE}" to unassign.`,
      );
    });

    it('should correctly check if user has a role', () => {
      aggregate.assignRole(actorUserId, EDITOR_ROLE);
      expect(aggregate.hasRole(EDITOR_ROLE)).toBe(true);
      expect(aggregate.hasRole(EDITOR_ROLE, 'uk')).toBe(true);
      aggregate.unassignRole(actorUserId, EDITOR_ROLE);
      expect(aggregate.hasRole(EDITOR_ROLE)).toBe(false);
      expect(aggregate.hasRole(EDITOR_ROLE, 'uk')).toBe(false);
      aggregate.assignRole(actorUserId, 'speaker', 'uk');
      expect(aggregate.hasRole(EDITOR_ROLE)).toBe(false);
      expect(aggregate.hasRole(EDITOR_ROLE, 'uk')).toBe(true);
    });
  });
});
