import { MultiFileRepository } from '../fs';
import type { Spreadsheet, SpreadsheetID } from '../dto';
import type { CryptoService } from '../types';

import { SpreadsheetOrganizer } from './organizers';
import { SpreadsheetSerializer } from './serialization';

export class SpreadsheetsRepository extends MultiFileRepository<
  SpreadsheetID,
  Spreadsheet
> {
  constructor(rootDirectory: string, cryptoService: CryptoService) {
    const fileOrganizer = new SpreadsheetOrganizer(rootDirectory);
    const entitySerializer = new SpreadsheetSerializer(cryptoService);

    super(fileOrganizer, entitySerializer);
  }
}
