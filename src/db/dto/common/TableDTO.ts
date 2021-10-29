import { RawRecord } from './RawRecord';

export interface TableDTO {
  serialize(): RawRecord;
}
