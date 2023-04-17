import { join } from 'node:path';

import { PlainOrganizer } from '../../fs/organizers';

export class ConfigOrganizer extends PlainOrganizer {
  constructor(rootDirectory: string) {
    super(join(rootDirectory, 'configs'), '.yml');
  }
}
