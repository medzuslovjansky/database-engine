import type { AggregateRoot } from '../aggregates';
import type { EventEnvelope } from '../envelopes';

import type { SnapshotStrategy } from './SnapshotStrategy';

/**
 * Creates a snapshot every N events
 */
export class DefaultSnapshotStrategy implements SnapshotStrategy {
  constructor(private readonly threshold: number = 100) {
    if (threshold < 1) {
      throw new Error('Snapshot threshold must be at least 1');
    }
  }

  maybeSave(aggregate: AggregateRoot, events: EventEnvelope[]): boolean {
    const before = aggregate.revision - events.length;
    return Math.floor(before / this.threshold) !== Math.floor(aggregate.revision / this.threshold);
  }
}
