import { RawRecord, TableDTO } from '../common';
import { asTrimmedString } from '../../utils';

export class IntelligibilityDTO implements TableDTO {
  public readonly id: string;
  public readonly isv: string; // serves as a reference
  public matches: string; // to be turned into a synset
  public Δmin: [number, number];
  public Δmax: [number, number];
  public details?: string;

  constructor(record: RawRecord) {
    this.id = asTrimmedString(record.id);
    this.isv = asTrimmedString(record.isv);
    this.matches = asTrimmedString(record.matches);
    this.Δmin = [Number(record.Δmin1), Number(record.Δmin2)];
    this.Δmax = [Number(record.Δmax1), Number(record.Δmax2)];
    this.details = asTrimmedString(record.details);
  }

  serialize(): RawRecord {
    return {
      id: this.id,
      isv: this.isv,
      details: this.details,
      matches: this.matches,
      Δmin1: Number.isFinite(this.Δmin[0]) ? this.Δmin[0] : undefined,
      Δmax1: Number.isFinite(this.Δmax[0]) ? this.Δmax[0] : undefined,
      Δmin2: Number.isFinite(this.Δmin[1]) ? this.Δmin[1] : undefined,
      Δmax2: Number.isFinite(this.Δmax[1]) ? this.Δmax[1] : undefined,
    };
  }
}
