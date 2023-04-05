import {UserID} from "./UsersConfig";

export type SpreadsheetsConfig = Record<SpreadsheetID, SpreadsheetConfig>;

export type SpreadsheetID = string;

export type SpreadsheetConfig = {
  id: string;
  name: string;
  permissions: Record<UserID, UserRole>;
  sheets: SheetConfig[];
};

export type UserRole = "owner" | "writer" | "reader";

export type SheetConfig = {
  /**
   * Unique name of the sheet
   */
  name: string;
  ranges: RangeConfig[];
};

export type RangeConfig = {
  name: string;
  range: string;

  warn?: true;
  editors?: UserID[];
};
