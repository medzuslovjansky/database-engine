import type { SteenEntryImportedEvent } from './SteenEntryImportedEventSchema';
import type { SteenEntryRemovedEvent } from './SteenEntryRemovedEventSchema';
import type { IntelligibilityRatedEvent } from './IntelligibilityRatedEventSchema';

export interface SteenEntryEventRegistry {
  SteenEntryImported: SteenEntryImportedEvent;
  SteenEntryRemoved: SteenEntryRemovedEvent;
  IntelligibilityRated: IntelligibilityRatedEvent;
}

export type SteenEntryEventType = keyof SteenEntryEventRegistry;

export type SteenEntryEvent = SteenEntryEventRegistry[SteenEntryEventType];

export { SteenEntryImportedEvent, SteenEntryRemovedEvent, IntelligibilityRatedEvent };
