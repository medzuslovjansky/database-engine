import { SheetsConfig } from './SheetsConfig';

export type RangeConfig = {
  name: string;
  range: string;
  warn: boolean;
  editors: Array<keyof SheetsConfig['users']>;
};
