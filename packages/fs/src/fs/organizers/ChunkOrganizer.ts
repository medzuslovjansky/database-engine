import path from 'node:path';

import chunk from 'lodash/chunk';

import type { FileOrganizer } from './FileOrganizer';

export class ChunkOrganizer implements FileOrganizer<number> {
  constructor(
    public readonly rootDirectory: string,
    public readonly maxLength: number,
    public readonly chunkSize: number,
  ) {}

  buildPath(id: unknown): string {
    const padded = `${id}`.padStart(this.maxLength, '0');
    const chunks = chunk([...padded], this.chunkSize).map((s) => s.join(''));
    return path.join(this.rootDirectory, ...chunks);
  }

  deduceId(entityPath: string): number {
    const relativePath = path.relative(this.rootDirectory, entityPath);
    const chunks = relativePath.split(path.sep);
    const padded = chunks.join('');
    return Number(padded);
  }

  getPatterns(): string[] {
    const chunksCount = Math.ceil(this.maxLength / this.chunkSize);
    return [path.posix.join(this.rootDirectory, '*/'.repeat(chunksCount))];
  }
}
