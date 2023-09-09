import type { sheets_v4 } from 'googleapis';

export type BatchExecutorConfig = {
  api: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetId?: number;
};

export type BatchExecutor$AppendRowsRequest = {
  sheetId?: number;
  values: unknown[][];
};

export type BatchExecutor$UpdateRowsRequest = {
  sheetId?: number;
  startRowIndex: number;
  startColumnIndex?: number;
  values: unknown[][];
  notes?: string[][];
};

export type BatchExecutor$DeleteRowsRequest = {
  sheetId?: number;
  startRowIndex: number;
  endRowIndex?: number;
};

export class BatchExecutor {
  private readonly api: sheets_v4.Sheets;
  private readonly spreadsheetId: string;
  private readonly sheetId?: number;
  private readonly requests: sheets_v4.Schema$Request[] = [];

  constructor(config: BatchExecutorConfig) {
    this.api = config.api;
    this.spreadsheetId = config.spreadsheetId;
    this.sheetId = config.sheetId;
  }

  clone(config: { sheetId?: number } = {}) {
    return new BatchExecutor({
      api: this.api,
      spreadsheetId: this.spreadsheetId,
      sheetId: config.sheetId ?? this.sheetId,
    });
  }

  clear(): void {
    this.requests.splice(0, this.requests.length);
  }

  async flush() {
    const requests = this.requests.splice(0, this.requests.length);
    if (requests.length === 0) {
      return;
    }

    await this.api.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: { requests },
    });
  }

  // @ts-expect-error 6133
  private addBanding(request: sheets_v4.Schema$AddBandingRequest): this {
    this.requests.push({ addBanding: request });
    return this;
  }

  // @ts-expect-error 6133
  private addChart(request: sheets_v4.Schema$AddChartRequest): this {
    this.requests.push({ addChart: request });
    return this;
  }

  // @ts-expect-error 6133
  private addConditionalFormatRule(
    request: sheets_v4.Schema$AddConditionalFormatRuleRequest,
  ): this {
    this.requests.push({ addConditionalFormatRule: request });
    return this;
  }

  // @ts-expect-error 6133
  private addDataSource(request: sheets_v4.Schema$AddDataSourceRequest): this {
    this.requests.push({ addDataSource: request });
    return this;
  }

  // @ts-expect-error 6133
  private addDimensionGroup(
    request: sheets_v4.Schema$AddDimensionGroupRequest,
  ): this {
    this.requests.push({ addDimensionGroup: request });
    return this;
  }

  // @ts-expect-error 6133
  private addFilterView(request: sheets_v4.Schema$AddFilterViewRequest): this {
    this.requests.push({ addFilterView: request });
    return this;
  }

  // @ts-expect-error 6133
  private addNamedRange(request: sheets_v4.Schema$AddNamedRangeRequest): this {
    this.requests.push({ addNamedRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private addProtectedRange(
    request: sheets_v4.Schema$AddProtectedRangeRequest,
  ): this {
    this.requests.push({ addProtectedRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private addSheet(request: sheets_v4.Schema$AddSheetRequest): this {
    this.requests.push({ addSheet: request });
    return this;
  }

  // @ts-expect-error 6133
  private addSlicer(request: sheets_v4.Schema$AddSlicerRequest): this {
    this.requests.push({ addSlicer: request });
    return this;
  }

  private appendCells(request: sheets_v4.Schema$AppendCellsRequest): this {
    this.requests.push({ appendCells: request });
    return this;
  }

  public appendRows(request: BatchExecutor$AppendRowsRequest): this {
    this.appendCells({
      fields: 'userEnteredValue',
      sheetId: request.sheetId ?? this.sheetId,
      rows: request.values.map((row) => ({
        values: row.map((value) => this._toCellData(value)),
      })),
    });

    return this;
  }

  public updateRows(request: BatchExecutor$UpdateRowsRequest): this {
    // eslint-disable-next-line unicorn/no-array-reduce
    const columnsCount = request.values.reduce(
      (max, row) => Math.max(max, row.length),
      0,
    );

    this.updateCells({
      fields: 'userEnteredValue',
      range: {
        sheetId: request.sheetId ?? this.sheetId,
        startRowIndex: request.startRowIndex,
        startColumnIndex: request.startColumnIndex ?? 0,
        endRowIndex: request.startRowIndex + request.values.length,
        endColumnIndex: (request.startColumnIndex ?? 0) + columnsCount,
      },
      rows: request.values.map((row, rowIndex) => ({
        values: row.map((value, colIndex) => {
          return this._toCellData(value, request.notes?.[rowIndex]?.[colIndex]);
        }),
      })),
    });

    return this;
  }

  public deleteRows(request: BatchExecutor$DeleteRowsRequest): this {
    this.deleteRange({
      range: {
        sheetId: request.sheetId ?? this.sheetId,
        startRowIndex: request.startRowIndex,
        endRowIndex: request.endRowIndex ?? request.startRowIndex + 1,
      },
      shiftDimension: 'ROWS',
    });

    return this;
  }

  private _toCellData(
    value: unknown,
    note?: string,
  ): sheets_v4.Schema$CellData {
    return typeof value === 'number'
      ? { note, userEnteredValue: { numberValue: value } }
      : { note, userEnteredValue: { stringValue: `${value}` } };
  }

  // @ts-expect-error 6133
  private appendDimension(
    request: sheets_v4.Schema$AppendDimensionRequest,
  ): this {
    this.requests.push({ appendDimension: request });
    return this;
  }

  // @ts-expect-error 6133
  private autoFill(request: sheets_v4.Schema$AutoFillRequest): this {
    this.requests.push({ autoFill: request });
    return this;
  }

  // @ts-expect-error 6133
  private autoResizeDimensions(
    request: sheets_v4.Schema$AutoResizeDimensionsRequest,
  ): this {
    this.requests.push({ autoResizeDimensions: request });
    return this;
  }

  // @ts-expect-error 6133
  private clearBasicFilter(
    request: sheets_v4.Schema$ClearBasicFilterRequest,
  ): this {
    this.requests.push({ clearBasicFilter: request });
    return this;
  }

  // @ts-expect-error 6133
  private copyPaste(request: sheets_v4.Schema$CopyPasteRequest): this {
    this.requests.push({ copyPaste: request });
    return this;
  }

  // @ts-expect-error 6133
  private createDeveloperMetadata(
    request: sheets_v4.Schema$CreateDeveloperMetadataRequest,
  ): this {
    this.requests.push({ createDeveloperMetadata: request });
    return this;
  }

  // @ts-expect-error 6133
  private cutPaste(request: sheets_v4.Schema$CutPasteRequest): this {
    this.requests.push({ cutPaste: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteBanding(request: sheets_v4.Schema$DeleteBandingRequest): this {
    this.requests.push({ deleteBanding: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteConditionalFormatRule(
    request: sheets_v4.Schema$DeleteConditionalFormatRuleRequest,
  ): this {
    this.requests.push({ deleteConditionalFormatRule: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteDataSource(
    request: sheets_v4.Schema$DeleteDataSourceRequest,
  ): this {
    this.requests.push({ deleteDataSource: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteDeveloperMetadata(
    request: sheets_v4.Schema$DeleteDeveloperMetadataRequest,
  ): this {
    this.requests.push({ deleteDeveloperMetadata: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteDimension(
    request: sheets_v4.Schema$DeleteDimensionRequest,
  ): this {
    this.requests.push({ deleteDimension: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteDimensionGroup(
    request: sheets_v4.Schema$DeleteDimensionGroupRequest,
  ): this {
    this.requests.push({ deleteDimensionGroup: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteDuplicates(
    request: sheets_v4.Schema$DeleteDuplicatesRequest,
  ): this {
    this.requests.push({ deleteDuplicates: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteEmbeddedObject(
    request: sheets_v4.Schema$DeleteEmbeddedObjectRequest,
  ): this {
    this.requests.push({ deleteEmbeddedObject: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteFilterView(
    request: sheets_v4.Schema$DeleteFilterViewRequest,
  ): this {
    this.requests.push({ deleteFilterView: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteNamedRange(
    request: sheets_v4.Schema$DeleteNamedRangeRequest,
  ): this {
    this.requests.push({ deleteNamedRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteProtectedRange(
    request: sheets_v4.Schema$DeleteProtectedRangeRequest,
  ): this {
    this.requests.push({ deleteProtectedRange: request });
    return this;
  }

  private deleteRange(request: sheets_v4.Schema$DeleteRangeRequest): this {
    this.requests.push({ deleteRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private deleteSheet(request: sheets_v4.Schema$DeleteSheetRequest): this {
    this.requests.push({ deleteSheet: request });
    return this;
  }

  // @ts-expect-error 6133
  private duplicateFilterView(
    request: sheets_v4.Schema$DuplicateFilterViewRequest,
  ): this {
    this.requests.push({ duplicateFilterView: request });
    return this;
  }

  // @ts-expect-error 6133
  private duplicateSheet(
    request: sheets_v4.Schema$DuplicateSheetRequest,
  ): this {
    this.requests.push({ duplicateSheet: request });
    return this;
  }

  // @ts-expect-error 6133
  private findReplace(request: sheets_v4.Schema$FindReplaceRequest): this {
    this.requests.push({ findReplace: request });
    return this;
  }

  // @ts-expect-error 6133
  private insertDimension(
    request: sheets_v4.Schema$InsertDimensionRequest,
  ): this {
    this.requests.push({ insertDimension: request });
    return this;
  }

  // @ts-expect-error 6133
  private insertRange(request: sheets_v4.Schema$InsertRangeRequest): this {
    this.requests.push({ insertRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private mergeCells(request: sheets_v4.Schema$MergeCellsRequest): this {
    this.requests.push({ mergeCells: request });
    return this;
  }

  // @ts-expect-error 6133
  private moveDimension(request: sheets_v4.Schema$MoveDimensionRequest): this {
    this.requests.push({ moveDimension: request });
    return this;
  }

  // @ts-expect-error 6133
  private pasteData(request: sheets_v4.Schema$PasteDataRequest): this {
    this.requests.push({ pasteData: request });
    return this;
  }

  // @ts-expect-error 6133
  private randomizeRange(
    request: sheets_v4.Schema$RandomizeRangeRequest,
  ): this {
    this.requests.push({ randomizeRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private refreshDataSource(
    request: sheets_v4.Schema$RefreshDataSourceRequest,
  ): this {
    this.requests.push({ refreshDataSource: request });
    return this;
  }

  // @ts-expect-error 6133
  private repeatCell(request: sheets_v4.Schema$RepeatCellRequest): this {
    this.requests.push({ repeatCell: request });
    return this;
  }

  // @ts-expect-error 6133
  private setBasicFilter(
    request: sheets_v4.Schema$SetBasicFilterRequest,
  ): this {
    this.requests.push({ setBasicFilter: request });
    return this;
  }

  // @ts-expect-error 6133
  private setDataValidation(
    request: sheets_v4.Schema$SetDataValidationRequest,
  ): this {
    this.requests.push({ setDataValidation: request });
    return this;
  }

  // @ts-expect-error 6133
  private sortRange(request: sheets_v4.Schema$SortRangeRequest): this {
    this.requests.push({ sortRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private textToColumns(request: sheets_v4.Schema$TextToColumnsRequest): this {
    this.requests.push({ textToColumns: request });
    return this;
  }

  // @ts-expect-error 6133
  private trimWhitespace(
    request: sheets_v4.Schema$TrimWhitespaceRequest,
  ): this {
    this.requests.push({ trimWhitespace: request });
    return this;
  }

  // @ts-expect-error 6133
  private unmergeCells(request: sheets_v4.Schema$UnmergeCellsRequest): this {
    this.requests.push({ unmergeCells: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateBanding(request: sheets_v4.Schema$UpdateBandingRequest): this {
    this.requests.push({ updateBanding: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateBorders(request: sheets_v4.Schema$UpdateBordersRequest): this {
    this.requests.push({ updateBorders: request });
    return this;
  }

  private updateCells(request: sheets_v4.Schema$UpdateCellsRequest): this {
    this.requests.push({ updateCells: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateChartSpec(
    request: sheets_v4.Schema$UpdateChartSpecRequest,
  ): this {
    this.requests.push({ updateChartSpec: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateConditionalFormatRule(
    request: sheets_v4.Schema$UpdateConditionalFormatRuleRequest,
  ): this {
    this.requests.push({ updateConditionalFormatRule: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateDataSource(
    request: sheets_v4.Schema$UpdateDataSourceRequest,
  ): this {
    this.requests.push({ updateDataSource: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateDeveloperMetadata(
    request: sheets_v4.Schema$UpdateDeveloperMetadataRequest,
  ): this {
    this.requests.push({ updateDeveloperMetadata: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateDimensionGroup(
    request: sheets_v4.Schema$UpdateDimensionGroupRequest,
  ): this {
    this.requests.push({ updateDimensionGroup: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateDimensionProperties(
    request: sheets_v4.Schema$UpdateDimensionPropertiesRequest,
  ): this {
    this.requests.push({ updateDimensionProperties: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateEmbeddedObjectBorder(
    request: sheets_v4.Schema$UpdateEmbeddedObjectBorderRequest,
  ): this {
    this.requests.push({ updateEmbeddedObjectBorder: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateEmbeddedObjectPosition(
    request: sheets_v4.Schema$UpdateEmbeddedObjectPositionRequest,
  ): this {
    this.requests.push({ updateEmbeddedObjectPosition: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateFilterView(
    request: sheets_v4.Schema$UpdateFilterViewRequest,
  ): this {
    this.requests.push({ updateFilterView: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateNamedRange(
    request: sheets_v4.Schema$UpdateNamedRangeRequest,
  ): this {
    this.requests.push({ updateNamedRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateProtectedRange(
    request: sheets_v4.Schema$UpdateProtectedRangeRequest,
  ): this {
    this.requests.push({ updateProtectedRange: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateSheetProperties(
    request: sheets_v4.Schema$UpdateSheetPropertiesRequest,
  ): this {
    this.requests.push({ updateSheetProperties: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateSlicerSpec(
    request: sheets_v4.Schema$UpdateSlicerSpecRequest,
  ): this {
    this.requests.push({ updateSlicerSpec: request });
    return this;
  }

  // @ts-expect-error 6133
  private updateSpreadsheetProperties(
    request: sheets_v4.Schema$UpdateSpreadsheetPropertiesRequest,
  ): this {
    this.requests.push({ updateSpreadsheetProperties: request });
    return this;
  }
}
