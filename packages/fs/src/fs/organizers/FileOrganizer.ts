export interface FileOrganizer<ID> {
  /**
   * Returns a list of glob patterns that can be used to find all files
   */
  getPatterns(): string[];
  /**
   * Builds a path to the file that contains the entity with the given ID
   * @param id
   */
  buildPath(id: ID): string;
  /**
   * Deduces the ID of an entity from its path
   * @param entityPath
   */
  deduceId(entityPath: string): ID;
}
