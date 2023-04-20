import { join } from 'node:path';

import { PlainOrganizer } from '../../fs/organizers';

export class UserOrganizer extends PlainOrganizer {
  constructor(rootDirectory: string) {
    super(join(rootDirectory, 'users'), '.yml');
  }
}
