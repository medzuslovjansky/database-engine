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

export class Sheet<T extends SheetRecord = SheetRecord> {
  private readonly _api: sheets_v4.Sheets;
  private readonly _batch: BatchExecutor;
  private readonly _properties: sheets_v4.Schema$SheetProperties;
  private _arrayMapper?: ArrayMapper<T>;

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

  async getValues(): Promise<ArrayMapped<T>[]> {
    const res = await this._api.spreadsheets.get({
      ranges: [this.title],
      spreadsheetId: this.spreadsheetId,
      fields: 'sheets(data(rowData(values(effectiveValue,note))))',
    });

    const rows =
      res.data.sheets![0].data![0].rowData?.filter((row) => row.values) ?? [];
    const notes = rows.map((row) =>
      row.values!.map((cell) => cell.note ?? undefined),
    );
    const values = rows.map((row) =>
      row.values!.map(
        ({ effectiveValue: v }) =>
          v?.stringValue ?? v?.numberValue ?? v?.boolValue,
      ),
    );

    this._ensureMapper(values);
    notes.shift();
    values.shift();

    const Mapper = this._arrayMapper!;
    const result = values.map((value, index) => {
      return new Mapper(value, index, notes[index]) as ArrayMapped<T>;
    });

    return result;
  }

  async flush(): Promise<void> {
    await this._batch.flush();
  }

  private _ensureMapper([headers]: unknown[][]) {
    if (!this._arrayMapper) {
      const mapperClassName = `${upperFirst(camelCase(this.title))}Mapper`;
      this._arrayMapper = createArrayMapperClass(
        mapperClassName,
        headers.map(String),
      );
    }
  }
}
