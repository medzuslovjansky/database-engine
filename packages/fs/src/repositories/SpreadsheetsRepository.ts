import { MultiFileRepository } from '../fs';
import type { Spreadsheet, SpreadsheetID } from '../dto';
import type { PIIHelper } from '../utils';

import { SpreadsheetOrganizer } from './organizers';
import { SpreadsheetSerializer } from './serialization';

export class SpreadsheetsRepository extends MultiFileRepository<
  SpreadsheetID,
  Spreadsheet
> {
  constructor(rootDirectory: string, piiHelper: PIIHelper) {
    const fileOrganizer = new SpreadsheetOrganizer(rootDirectory);
    const entitySerializer = new SpreadsheetSerializer(piiHelper);

    super(fileOrganizer, entitySerializer);
  }
}
