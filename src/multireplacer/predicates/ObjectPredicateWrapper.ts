import { Intermediate } from '../Intermediate';
import { ObjectPredicate } from './ObjectPredicate';
import { FunctionPredicate } from './FunctionPredicate';
import { Predicate } from './Predicate';

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
