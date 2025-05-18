/**
 * Store for retrieving projection position checkpoints.
 */
export interface ProjectionStore {
  /**
   * Get the current positions for a set of projections.
   * These positions represent the ID of the last event successfully processed
   * by each projection in a previous run.
   * @param projectionNames Array of projection names (strings).
   * @returns A Promise that resolves to a Record mapping projection names to their positions (event IDs).
   */
  getPositions(projectionNames: string[]): Promise<Record<string, number>>;
}
