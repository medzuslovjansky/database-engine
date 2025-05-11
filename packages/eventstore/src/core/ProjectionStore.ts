export interface ProjectionStore {
  loadCheckpoint(name: string): Promise<number>; // default 0
  saveCheckpoint(name: string, lastGlobalEventId: number): Promise<void>;
}
