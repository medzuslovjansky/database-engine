import { join } from 'node:path';

import { PlainOrganizer } from '../../fs/organizers';

export class SpreadsheetOrganizer extends PlainOrganizer {
  constructor(rootDirectory: string) {
    super(join(rootDirectory, 'spreadsheets'), '.yml');
  }
}
