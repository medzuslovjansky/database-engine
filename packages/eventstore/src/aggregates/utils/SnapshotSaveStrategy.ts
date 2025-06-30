import type { Event } from '../../envelopes';
import type { AggregateRoot } from '../AggregateRoot';

/**
 * Determines whether a snapshot should be saved for an aggregate root after applying events.
 * @param aggregate The aggregate root to potentially snapshot
 * @param events The events that were just applied to the aggregate
 * @returns True if a snapshot should be saved, false otherwise
 */
export type SnapshotSaveStrategy = (aggregate: AggregateRoot, events: Event[]) => boolean;
