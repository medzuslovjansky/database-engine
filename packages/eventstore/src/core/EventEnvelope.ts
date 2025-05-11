// Event envelope structure for all events
export interface EventEnvelope<T = unknown> {
  /** global, monotonically increasing – assigned by store */
  id?: number;
  /** logical stream (aggregate) */
  stream: string;
  /** per-stream revision, expected by caller, ↺ 0 if you ignore OCC for now */
  revision?: number; // Optional for fast event store
  type: string;
  data: T;
  ts: number; // epoch ms
}
