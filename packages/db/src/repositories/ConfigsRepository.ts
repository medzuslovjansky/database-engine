import { MultiFileRepository } from '../fs';
import type { Secrets } from '../dto';

import { ConfigOrganizer } from './organizers';
import { ConfigSerializer } from './serialization';

export class ConfigsRepository extends MultiFileRepository<string, any> {
  constructor(rootDirectory: string) {
    const fileOrganizer = new ConfigOrganizer(rootDirectory);
    const entitySerializer = new ConfigSerializer();

    super(fileOrganizer, entitySerializer);
  }

  secrets(): Promise<Secrets> {
    return this.findById('secrets')!;
  }
}
