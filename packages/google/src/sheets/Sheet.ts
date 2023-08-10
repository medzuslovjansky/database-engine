import { camelCase, upperFirst } from 'lodash';
import type { sheets_v4 } from 'googleapis';

import type { ArrayMapped, ArrayMapper } from '../utils/createArrayMapperClass';
import { createArrayMapperClass } from '../utils/createArrayMapperClass';

import type { BatchExecutor } from './BatchExecutor';
import type { SheetRecord } from './SheetRecord';

export type SheetConfig = {
  api: sheets_v4.Sheets;
  batch: BatchExecutor;
  spreadsheetId: string;
  properties: sheets_v4.Schema$SheetProperties;
  protectedRanges: sheets_v4.Schema$ProtectedRange[];
};

export type Sheet$GetValuesOptions = {
  range?: string;
};

export type Notes<T> = {
  [K in keyof T]: string | undefined;
};

export type Annotated<T, M extends ArrayMapped<T> = ArrayMapped<T>> = M & {
  getNotes(): Notes<T>;
};

export class Sheet<T extends SheetRecord = SheetRecord> {
  private readonly _api: sheets_v4.Sheets;
  private readonly _batch: BatchExecutor;
  private readonly _properties: sheets_v4.Schema$SheetProperties;
  private _arrayMapper?: ArrayMapper<T>;
  private _noteArrayMapper?: ArrayMapper<Notes<T>>;

  public readonly protectedRanges: sheets_v4.Schema$ProtectedRange[];
  public readonly spreadsheetId: string;

  constructor(config: SheetConfig) {
    this._api = config.api;
    this._batch = config.batch;
    this._properties = config.properties;

    this.spreadsheetId = config.spreadsheetId;
    this.protectedRanges = config.protectedRanges;
  }

  get Mapper(): ArrayMapper<T> | undefined {
    return this._arrayMapper;
  }

  get id(): number {
    return this._properties.sheetId!;
  }

  get title(): string {
    return this._properties.title!;
  }

  get batch(): BatchExecutor {
    return this._batch;
  }

  async getValues(): Promise<Annotated<T>[]> {
    const res = await this._api.spreadsheets.get({
      ranges: [this.title],
      spreadsheetId: this.spreadsheetId,
      fields: 'sheets(data(rowData(values(userEnteredValue,note))))',
    });

    const sheet = res.data.sheets![0].data![0];
    const values = sheet.rowData.map((row) => {
      return (
        row.values?.map((value) => {
          const uev = value.userEnteredValue!;
          return uev.stringValue ?? uev.numberValue ?? uev.boolValue;
        }) ?? []
      );
    });

    const notes = sheet.rowData.map((row) => {
      return (
        row.values?.map((value) => {
          return value.note;
        }) ?? []
      );
    });

    const Mapper = this._ensureMapper(values);

    values.shift();
    notes.shift();
    const results: Annotated<T>[] = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const note = notes[i];
      const mapped = new Mapper(value, i) as Annotated<T>;
      const mappedNotes = new Mapper(note, i) as Notes<T>;
      results.push(Object.assign(mapped, { getNotes: () => mappedNotes }));
    }

    return results;
  }

  async flush(): Promise<void> {
    await this._batch.flush();
  }

  private _ensureMapper([headers]: unknown[][]) {
    if (!this._arrayMapper) {
      const title = this.title;
      const theHeaders = headers.map(String) as keyof T[];
      const valueMapperClassName = `${upperFirst(camelCase(title))}ValueMapper`;
      this._arrayMapper = createArrayMapperClass(
        valueMapperClassName,
        theHeaders,
      );
    }

    return this._arrayMapper;
  }
}
