import { userCreatedEventSchema } from './user-created';
import { userRoleAddedEventSchema } from './user-role-added';
import { userRoleRemovedEventSchema } from './user-role-removed';
import { userUpdatedEventSchema } from './user-updated';
import { steenEntryImportedEventSchema } from './steen-entry-imported';
import { steenEntryRemovedEventSchema } from './steen-entry-removed';
import type { z } from 'zod';

export const eventRegistry = {
  UserCreated: {
    name: 'UserCreated',
    schema: userCreatedEventSchema,
    type: {} as z.infer<typeof userCreatedEventSchema>,
  },
  UserRoleAdded: {
    name: 'UserRoleAdded',
    schema: userRoleAddedEventSchema,
    type: {} as z.infer<typeof userRoleAddedEventSchema>,
  },
  UserRoleRemoved: {
    name: 'UserRoleRemoved',
    schema: userRoleRemovedEventSchema,
    type: {} as z.infer<typeof userRoleRemovedEventSchema>,
  },
  UserUpdated: {
    name: 'UserUpdated',
    schema: userUpdatedEventSchema,
    type: {} as z.infer<typeof userUpdatedEventSchema>,
  },
  SteenEntryImported: {
    name: 'SteenEntryImported',
    schema: steenEntryImportedEventSchema,
    type: {} as z.infer<typeof steenEntryImportedEventSchema>,
  },
  SteenEntryRemoved: {
    name: 'SteenEntryRemoved',
    schema: steenEntryRemovedEventSchema,
    type: {} as z.infer<typeof steenEntryRemovedEventSchema>,
  },
  // Add more events here as needed
};

export type EventName = keyof typeof eventRegistry;
export type EventEntry<T extends EventName = EventName> = typeof eventRegistry[T];
export type EventPayload<T extends EventName> = typeof eventRegistry[T]['type'];
export type EventSchema<T extends EventName> = typeof eventRegistry[T]['schema'];

export type EventPayloadMap = {
  [K in EventName]: typeof eventRegistry[K]['type'];
};
