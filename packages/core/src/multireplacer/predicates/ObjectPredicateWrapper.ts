import type { Intermediate } from '../Intermediate';

import type { ObjectPredicate } from './ObjectPredicate';
import type { FunctionPredicate } from './FunctionPredicate';
import type { Predicate } from './Predicate';

export class ObjectPredicateWrapper<Context>
  implements ObjectPredicate<Context>
{
  protected sign: boolean;
  protected fn: FunctionPredicate<Context>;

  constructor(predicate: Predicate<Context>, sign = true) {
    this.sign = Boolean(sign);
    this.fn =
      typeof predicate === 'function'
        ? predicate
        : predicate.appliesTo.bind(predicate);
  }

  appliesTo(value: Intermediate<Context>): boolean {
    return this.sign === Boolean(this.fn(value));
  }
}
