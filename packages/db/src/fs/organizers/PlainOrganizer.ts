import path from 'node:path';

import type { FileOrganizer } from './FileOrganizer';

export class PlainOrganizer implements FileOrganizer<string> {
  constructor(
    public readonly rootDirectory: string,
    public readonly fileExtension: string,
  ) {}

  buildPath(id: unknown): string {
    return path.join(this.rootDirectory, id + this.fileExtension);
  }

  deduceId(entityPath: string): string {
    return path.basename(entityPath, this.fileExtension);
  }

  getPatterns(): string[] {
    return [path.posix.join(this.rootDirectory, '*' + this.fileExtension)];
  }
}
