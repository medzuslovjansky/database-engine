import type { AggregateRoot } from '../aggregates';
import type { EventEnvelope } from '../envelopes';
import type { EventRegistry } from '../types';

export interface SnapshotStrategy<R extends EventRegistry = EventRegistry> {
  /**
   * Determines if a snapshot should be created for the aggregate
   * based on the current state and new events
   */
  maybeSave(aggregate: AggregateRoot<any, R>, events: EventEnvelope<R>[]): boolean;
}
