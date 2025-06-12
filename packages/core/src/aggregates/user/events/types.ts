import type { Event } from '@interslavic/database-engine-eventstore';

import type { UserCreatedEventData } from './UserCreatedEventSchema';
import type { RoleAssignedEventData } from './RoleAssignedEventSchema';
import type { RoleUnassignedEventData } from './RoleUnassignedEventSchema';

// Define specific event interfaces
export type UserCreatedEvent = Event<'UserCreated', UserCreatedEventData>
export type RoleAssignedEvent = Event<'RoleAssigned', RoleAssignedEventData>
export type RoleUnassignedEvent = Event<'RoleUnassigned', RoleUnassignedEventData>

// Use a union of all specific event types
export type UserEvent =
  | UserCreatedEvent
  | RoleAssignedEvent
  | RoleUnassignedEvent;

export type { UserCreatedEventData } from './UserCreatedEventSchema';
export type { RoleAssignedEventData } from './RoleAssignedEventSchema';
export type { RoleUnassignedEventData } from './RoleUnassignedEventSchema';
