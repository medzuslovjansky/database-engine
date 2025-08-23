import { StreamIdentifier } from '@interslavic/database-engine-eventstore';

import type {
  UserCreatedEvent,
  RoleAssignedEvent,
  RoleUnassignedEvent,
} from './events';
import { UserAggregate } from './UserAggregate';

const ADMIN_ROLE = 'admin';
const EDITOR_ROLE = 'editor';

describe('UserAggregate', () => {
  const actorUser = StreamIdentifier.fromString('users/admin');
  const user = StreamIdentifier.fromString('users/user');

  let aggregate: UserAggregate;

  beforeEach(() => {
    aggregate = new UserAggregate(user);
    aggregate.initializeUser();
    aggregate.pullEvents(); // Clear the UserCreated event for each test
  });

  it('should initialize a user and raise UserCreated event', () => {
    const freshAggregate = new UserAggregate(user);
    freshAggregate.initializeUser();
    const events = freshAggregate.pullEvents();
    expect(events).toHaveLength(1);
    const event = events[0] as UserCreatedEvent;
    expect(event.type).toBe('UserCreated');
    expect(event.data.user_id).toBe(user.id);
    expect(event.stream).toEqual(user);
    expect(event.revision).toBe(1);
  });

  it('should throw an error if initializing an already initialized user', () => {
    expect(() => aggregate.initializeUser()).toThrow('User already initialized. Cannot call initializeUser again.');
  });

  describe('after user is initialized', () => {
    it('should assign a new role and raise RoleAssigned event', () => {
      aggregate.assignRole(actorUser.id, ADMIN_ROLE);
      expect(aggregate.state.roles.has(ADMIN_ROLE)).toBe(true);
      expect(aggregate.revision).toBe(2);
      const events = aggregate.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as RoleAssignedEvent;
      expect(event.type).toBe('RoleAssigned');
      expect(event.data.user_id).toBe(user.id);
      expect(event.data.role).toBe(ADMIN_ROLE);
      expect(event.data.issuer_id).toBe(actorUser.id);
      expect(event.revision).toBe(2);
    });

    it('should unassign an existing role and raise RoleUnassigned event', () => {
      aggregate.assignRole(actorUser.id, EDITOR_ROLE);
      aggregate.pullEvents();

      aggregate.unassignRole(actorUser.id, EDITOR_ROLE);
      expect(aggregate.state.roles.has(EDITOR_ROLE)).toBe(false);
      expect(aggregate.revision).toBe(3);
      const events = aggregate.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as RoleUnassignedEvent;
      expect(event.type).toBe('RoleUnassigned');
      expect(event.data.user_id).toBe(user.id);
      expect(event.data.role).toBe(EDITOR_ROLE);
      expect(event.data.issuer_id).toBe(actorUser.id);
      expect(event.revision).toBe(3);
    });

    it('should throw an error if unassigning a non-existing role', () => {
      expect(() => aggregate.unassignRole(actorUser.id, ADMIN_ROLE)).toThrow(
        `Could not find role "${ADMIN_ROLE}" to unassign.`,
      );
    });

    it('should correctly check if user has a role', () => {
      aggregate.assignRole(actorUser.id, EDITOR_ROLE);
      expect(aggregate.hasRole(EDITOR_ROLE)).toBe(true);
      expect(aggregate.hasRole(EDITOR_ROLE, 'uk')).toBe(true);
      aggregate.unassignRole(actorUser.id, EDITOR_ROLE);
      expect(aggregate.hasRole(EDITOR_ROLE)).toBe(false);
      expect(aggregate.hasRole(EDITOR_ROLE, 'uk')).toBe(false);
      aggregate.assignRole(actorUser.id, 'speaker', 'uk');
      expect(aggregate.hasRole(EDITOR_ROLE)).toBe(false);
      expect(aggregate.hasRole(EDITOR_ROLE, 'uk')).toBe(true);
    });
  });
});
