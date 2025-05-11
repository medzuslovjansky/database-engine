export interface EventEnvelope<T = unknown> {
  /** global, monotonically increasing – assigned by store */
  id?: number;
  /** logical stream (aggregate) */
  stream: string;
  /** per-stream revision, expected by caller */
  revision: number;
  type: string;
  data: T;
  ts: number; // epoch ms
}
