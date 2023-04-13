import { MultiFileRepository } from '../fs';
import type { Spreadsheet, SpreadsheetID } from '../dto';

export class SpreadsheetsRepository extends MultiFileRepository<
  SpreadsheetID,
  Spreadsheet
> {}
