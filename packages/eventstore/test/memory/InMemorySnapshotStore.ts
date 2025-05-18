import type { SnapshotStore } from '../../src/stores';
import type { Snapshot } from '../../src/envelopes';
import type { StreamPointer } from '../../src/types';
import { StreamIdentifier } from '../../src/primitives';

export class InMemorySnapshotStore implements SnapshotStore {
  // Change to store snapshots by stream ID + revision to avoid overwriting
  private readonly snapshots: Snapshot[] = [];

  constructor(initialSnapshots: Snapshot[] = []) {
    this.snapshots.push(...initialSnapshots);
  }

  addSnapshots(snapshots: Snapshot[]): void {
    for (const snapshot of snapshots) {
      this.snapshots.push({...snapshot});
    }
  }

  async getBatch<S>(pointers: StreamPointer[]): Promise<Snapshot<S>[]> {
    const result: Snapshot<S>[] = [];

    for (const pointer of pointers) {
      const stream = typeof pointer.stream === 'string'
        ? StreamIdentifier.fromString(pointer.stream)
        : pointer.stream;
      const streamId = stream.toString();

      // Find the latest snapshot for this stream that's <= the pointer revision
      const matchingSnapshots = this.snapshots
        .filter(s => s.stream.toString() === streamId &&
                    (pointer.revision === undefined || s.revision <= pointer.revision))
        .sort((a, b) => b.revision - a.revision);

      if (matchingSnapshots.length > 0) {
        result.push(matchingSnapshots[0] as Snapshot<S>);
      }
    }

    return result;
  }

  async getLatest<S>(streams: StreamIdentifier[]): Promise<Snapshot<S>[]> {
    return this.getBatch<S>(streams.map(stream => ({ stream })));
  }

  get allSnapshots(): Snapshot[] {
    return [...this.snapshots];
  }

  clear(): void {
    this.snapshots.length = 0;
  }
}
