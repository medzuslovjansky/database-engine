import type { sheets_v4 } from 'googleapis';

export type BatchExecutorConfig = {
  api: sheets_v4.Sheets;
  spreadsheetId: string;
};

export class BatchExecutor {
  private readonly api: sheets_v4.Sheets;
  private readonly spreadsheetId: string;
  private readonly requests: sheets_v4.Schema$Request[] = [];

  constructor(config: BatchExecutorConfig) {
    this.api = config.api;
    this.spreadsheetId = config.spreadsheetId;
  }

  async flush() {
    const requests = this.requests.splice(0, this.requests.length);

    await this.api.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: { requests },
    });
  }

  addBanding(request: sheets_v4.Schema$AddBandingRequest): this {
    this.requests.push({ addBanding: request });
    return this;
  }

  addChart(request: sheets_v4.Schema$AddChartRequest): this {
    this.requests.push({ addChart: request });
    return this;
  }

  addConditionalFormatRule(
    request: sheets_v4.Schema$AddConditionalFormatRuleRequest,
  ): this {
    this.requests.push({ addConditionalFormatRule: request });
    return this;
  }

  addDataSource(request: sheets_v4.Schema$AddDataSourceRequest): this {
    this.requests.push({ addDataSource: request });
    return this;
  }

  addDimensionGroup(request: sheets_v4.Schema$AddDimensionGroupRequest): this {
    this.requests.push({ addDimensionGroup: request });
    return this;
  }

  addFilterView(request: sheets_v4.Schema$AddFilterViewRequest): this {
    this.requests.push({ addFilterView: request });
    return this;
  }

  addNamedRange(request: sheets_v4.Schema$AddNamedRangeRequest): this {
    this.requests.push({ addNamedRange: request });
    return this;
  }

  addProtectedRange(request: sheets_v4.Schema$AddProtectedRangeRequest): this {
    this.requests.push({ addProtectedRange: request });
    return this;
  }

  addSheet(request: sheets_v4.Schema$AddSheetRequest): this {
    this.requests.push({ addSheet: request });
    return this;
  }

  addSlicer(request: sheets_v4.Schema$AddSlicerRequest): this {
    this.requests.push({ addSlicer: request });
    return this;
  }

  appendCells(request: sheets_v4.Schema$AppendCellsRequest): this {
    this.requests.push({ appendCells: request });
    return this;
  }

  appendDimension(request: sheets_v4.Schema$AppendDimensionRequest): this {
    this.requests.push({ appendDimension: request });
    return this;
  }

  autoFill(request: sheets_v4.Schema$AutoFillRequest): this {
    this.requests.push({ autoFill: request });
    return this;
  }

  autoResizeDimensions(
    request: sheets_v4.Schema$AutoResizeDimensionsRequest,
  ): this {
    this.requests.push({ autoResizeDimensions: request });
    return this;
  }

  clearBasicFilter(request: sheets_v4.Schema$ClearBasicFilterRequest): this {
    this.requests.push({ clearBasicFilter: request });
    return this;
  }

  copyPaste(request: sheets_v4.Schema$CopyPasteRequest): this {
    this.requests.push({ copyPaste: request });
    return this;
  }

  createDeveloperMetadata(
    request: sheets_v4.Schema$CreateDeveloperMetadataRequest,
  ): this {
    this.requests.push({ createDeveloperMetadata: request });
    return this;
  }

  cutPaste(request: sheets_v4.Schema$CutPasteRequest): this {
    this.requests.push({ cutPaste: request });
    return this;
  }

  deleteBanding(request: sheets_v4.Schema$DeleteBandingRequest): this {
    this.requests.push({ deleteBanding: request });
    return this;
  }

  deleteConditionalFormatRule(
    request: sheets_v4.Schema$DeleteConditionalFormatRuleRequest,
  ): this {
    this.requests.push({ deleteConditionalFormatRule: request });
    return this;
  }

  deleteDataSource(request: sheets_v4.Schema$DeleteDataSourceRequest): this {
    this.requests.push({ deleteDataSource: request });
    return this;
  }

  deleteDeveloperMetadata(
    request: sheets_v4.Schema$DeleteDeveloperMetadataRequest,
  ): this {
    this.requests.push({ deleteDeveloperMetadata: request });
    return this;
  }

  deleteDimension(request: sheets_v4.Schema$DeleteDimensionRequest): this {
    this.requests.push({ deleteDimension: request });
    return this;
  }

  deleteDimensionGroup(
    request: sheets_v4.Schema$DeleteDimensionGroupRequest,
  ): this {
    this.requests.push({ deleteDimensionGroup: request });
    return this;
  }

  deleteDuplicates(request: sheets_v4.Schema$DeleteDuplicatesRequest): this {
    this.requests.push({ deleteDuplicates: request });
    return this;
  }

  deleteEmbeddedObject(
    request: sheets_v4.Schema$DeleteEmbeddedObjectRequest,
  ): this {
    this.requests.push({ deleteEmbeddedObject: request });
    return this;
  }

  deleteFilterView(request: sheets_v4.Schema$DeleteFilterViewRequest): this {
    this.requests.push({ deleteFilterView: request });
    return this;
  }

  deleteNamedRange(request: sheets_v4.Schema$DeleteNamedRangeRequest): this {
    this.requests.push({ deleteNamedRange: request });
    return this;
  }

  deleteProtectedRange(
    request: sheets_v4.Schema$DeleteProtectedRangeRequest,
  ): this {
    this.requests.push({ deleteProtectedRange: request });
    return this;
  }

  deleteRange(request: sheets_v4.Schema$DeleteRangeRequest): this {
    this.requests.push({ deleteRange: request });
    return this;
  }

  deleteSheet(request: sheets_v4.Schema$DeleteSheetRequest): this {
    this.requests.push({ deleteSheet: request });
    return this;
  }

  duplicateFilterView(
    request: sheets_v4.Schema$DuplicateFilterViewRequest,
  ): this {
    this.requests.push({ duplicateFilterView: request });
    return this;
  }

  duplicateSheet(request: sheets_v4.Schema$DuplicateSheetRequest): this {
    this.requests.push({ duplicateSheet: request });
    return this;
  }

  findReplace(request: sheets_v4.Schema$FindReplaceRequest): this {
    this.requests.push({ findReplace: request });
    return this;
  }

  insertDimension(request: sheets_v4.Schema$InsertDimensionRequest): this {
    this.requests.push({ insertDimension: request });
    return this;
  }

  insertRange(request: sheets_v4.Schema$InsertRangeRequest): this {
    this.requests.push({ insertRange: request });
    return this;
  }

  mergeCells(request: sheets_v4.Schema$MergeCellsRequest): this {
    this.requests.push({ mergeCells: request });
    return this;
  }

  moveDimension(request: sheets_v4.Schema$MoveDimensionRequest): this {
    this.requests.push({ moveDimension: request });
    return this;
  }

  pasteData(request: sheets_v4.Schema$PasteDataRequest): this {
    this.requests.push({ pasteData: request });
    return this;
  }

  randomizeRange(request: sheets_v4.Schema$RandomizeRangeRequest): this {
    this.requests.push({ randomizeRange: request });
    return this;
  }

  refreshDataSource(request: sheets_v4.Schema$RefreshDataSourceRequest): this {
    this.requests.push({ refreshDataSource: request });
    return this;
  }

  repeatCell(request: sheets_v4.Schema$RepeatCellRequest): this {
    this.requests.push({ repeatCell: request });
    return this;
  }

  setBasicFilter(request: sheets_v4.Schema$SetBasicFilterRequest): this {
    this.requests.push({ setBasicFilter: request });
    return this;
  }

  setDataValidation(request: sheets_v4.Schema$SetDataValidationRequest): this {
    this.requests.push({ setDataValidation: request });
    return this;
  }

  sortRange(request: sheets_v4.Schema$SortRangeRequest): this {
    this.requests.push({ sortRange: request });
    return this;
  }

  textToColumns(request: sheets_v4.Schema$TextToColumnsRequest): this {
    this.requests.push({ textToColumns: request });
    return this;
  }

  trimWhitespace(request: sheets_v4.Schema$TrimWhitespaceRequest): this {
    this.requests.push({ trimWhitespace: request });
    return this;
  }

  unmergeCells(request: sheets_v4.Schema$UnmergeCellsRequest): this {
    this.requests.push({ unmergeCells: request });
    return this;
  }

  updateBanding(request: sheets_v4.Schema$UpdateBandingRequest): this {
    this.requests.push({ updateBanding: request });
    return this;
  }

  updateBorders(request: sheets_v4.Schema$UpdateBordersRequest): this {
    this.requests.push({ updateBorders: request });
    return this;
  }

  updateCells(request: sheets_v4.Schema$UpdateCellsRequest): this {
    this.requests.push({ updateCells: request });
    return this;
  }

  updateChartSpec(request: sheets_v4.Schema$UpdateChartSpecRequest): this {
    this.requests.push({ updateChartSpec: request });
    return this;
  }

  updateConditionalFormatRule(
    request: sheets_v4.Schema$UpdateConditionalFormatRuleRequest,
  ): this {
    this.requests.push({ updateConditionalFormatRule: request });
    return this;
  }

  updateDataSource(request: sheets_v4.Schema$UpdateDataSourceRequest): this {
    this.requests.push({ updateDataSource: request });
    return this;
  }

  updateDeveloperMetadata(
    request: sheets_v4.Schema$UpdateDeveloperMetadataRequest,
  ): this {
    this.requests.push({ updateDeveloperMetadata: request });
    return this;
  }

  updateDimensionGroup(
    request: sheets_v4.Schema$UpdateDimensionGroupRequest,
  ): this {
    this.requests.push({ updateDimensionGroup: request });
    return this;
  }

  updateDimensionProperties(
    request: sheets_v4.Schema$UpdateDimensionPropertiesRequest,
  ): this {
    this.requests.push({ updateDimensionProperties: request });
    return this;
  }

  updateEmbeddedObjectBorder(
    request: sheets_v4.Schema$UpdateEmbeddedObjectBorderRequest,
  ): this {
    this.requests.push({ updateEmbeddedObjectBorder: request });
    return this;
  }

  updateEmbeddedObjectPosition(
    request: sheets_v4.Schema$UpdateEmbeddedObjectPositionRequest,
  ): this {
    this.requests.push({ updateEmbeddedObjectPosition: request });
    return this;
  }

  updateFilterView(request: sheets_v4.Schema$UpdateFilterViewRequest): this {
    this.requests.push({ updateFilterView: request });
    return this;
  }

  updateNamedRange(request: sheets_v4.Schema$UpdateNamedRangeRequest): this {
    this.requests.push({ updateNamedRange: request });
    return this;
  }

  updateProtectedRange(
    request: sheets_v4.Schema$UpdateProtectedRangeRequest,
  ): this {
    this.requests.push({ updateProtectedRange: request });
    return this;
  }

  updateSheetProperties(
    request: sheets_v4.Schema$UpdateSheetPropertiesRequest,
  ): this {
    this.requests.push({ updateSheetProperties: request });
    return this;
  }

  updateSlicerSpec(request: sheets_v4.Schema$UpdateSlicerSpecRequest): this {
    this.requests.push({ updateSlicerSpec: request });
    return this;
  }

  updateSpreadsheetProperties(
    request: sheets_v4.Schema$UpdateSpreadsheetPropertiesRequest,
  ): this {
    this.requests.push({ updateSpreadsheetProperties: request });
    return this;
  }
}
