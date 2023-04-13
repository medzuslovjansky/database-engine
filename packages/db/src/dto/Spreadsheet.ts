import type { UserID } from './Users';

export type SpreadsheetID = string;

export type Spreadsheet = {
  id: string;
  googleId: string;
  permissions: Record<UserID, UserRole>;
  sheets: Sheet[];
};

export type UserRole = 'owner' | 'writer' | 'reader';

export type Sheet = {
  /**
   * Unique name of the sheet
   */
  name: string;
  ranges: Range[];
};

export type Range = {
  name: string;
  range: string;

  warn?: true;
  editors?: UserID[];
};
