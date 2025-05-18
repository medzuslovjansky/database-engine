import type { Event } from '../../envelopes';
import { InvalidSnapshotThresholdError } from '../../errors';
import type { AggregateRoot } from '../AggregateRoot';
import type { SnapshotSaveStrategy } from './SnapshotSaveStrategy';


/**
 * Creates a snapshot every N events
 * @param threshold The number of events after which to create a snapshot (default: 100)
 */
export function createThresholdSnapshotStrategy(threshold: number = 1): SnapshotSaveStrategy {
  if (threshold < 1) throw new InvalidSnapshotThresholdError(1);

  return (aggregate: AggregateRoot, events: Event[]): boolean => {
    const before = aggregate.revision - events.length;
    return Math.floor(before / threshold) !== Math.floor(aggregate.revision / threshold);
  };
}
