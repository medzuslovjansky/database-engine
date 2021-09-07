import { Replacement, Intermediate } from '@interslavic/odometer';
import { BareRecord } from './BareRecord';

export class InterslavicIntermediate extends Intermediate<
  BareRecord,
  Replacement<BareRecord>
> {}
