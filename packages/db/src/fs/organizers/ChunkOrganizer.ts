import path from 'node:path';

import chunk from 'lodash/chunk';

export class ChunkOrganizer {
  constructor(
    public readonly maxLength: number,
    public readonly chunkSize: number,
  ) {}

  buildPath(id: number): string {
    const padded = `${id}`.padStart(this.maxLength, '0');
    const chunks = chunk(padded, this.chunkSize).map((s) => s.join(''));
    return path.join(...chunks);
  }
}
