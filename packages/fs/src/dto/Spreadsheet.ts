import type { UserID } from './User';

export type SpreadsheetID = string;

export type Spreadsheet = {
  id: string;
  google_id: string;
  permissions: DrivePermission[];
  sheets: Sheet[];
};

export type DrivePermission = {
  name: string;
  email: string;
  role: UserRole;
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
