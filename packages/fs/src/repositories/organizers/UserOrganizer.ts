import path from 'node:path';

import { PlainOrganizer } from '../../fs/organizers';

export class UserOrganizer extends PlainOrganizer {
  constructor(rootDirectory: string) {
    super(path.join(rootDirectory, 'users'), '.yml');
  }
}
