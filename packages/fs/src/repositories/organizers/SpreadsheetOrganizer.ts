import path from 'node:path';

import { PlainOrganizer } from '../../fs/organizers';

export class SpreadsheetOrganizer extends PlainOrganizer {
  constructor(rootDirectory: string) {
    super(path.join(rootDirectory, 'spreadsheets'), '.yml');
  }
}
