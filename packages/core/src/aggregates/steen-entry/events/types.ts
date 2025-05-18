import type { Event } from '@interslavic/database-engine-eventstore';

import type { SteenEntryImportedPayload } from './SteenEntryImportedEventSchema';
import type { SteenEntryRemovedPayload } from './SteenEntryRemovedEventSchema';
import type { IntelligibilityRatedPayload } from './IntelligibilityRatedEventSchema';

export type SteenEntryImportedEvent = Event<'SteenEntryImported', SteenEntryImportedPayload>
export type SteenEntryRemovedEvent = Event<'SteenEntryRemoved', SteenEntryRemovedPayload>
export type IntelligibilityRatedEvent = Event<'IntelligibilityRated', IntelligibilityRatedPayload>

export type SteenEntryEvent =
  | SteenEntryImportedEvent
  | SteenEntryRemovedEvent
  | IntelligibilityRatedEvent;

export type { SteenEntryImportedPayload } from './SteenEntryImportedEventSchema';
export type { SteenEntryRemovedPayload } from './SteenEntryRemovedEventSchema';
export type { IntelligibilityRatedPayload } from './IntelligibilityRatedEventSchema';
