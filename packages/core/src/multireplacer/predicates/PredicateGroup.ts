import { Intermediate } from '../Intermediate';
import { Predicate } from './Predicate';
import { ObjectPredicate } from './ObjectPredicate';
import { ObjectPredicateWrapper } from './ObjectPredicateWrapper';

export class PredicateGroup<Context> implements ObjectPredicate<Context> {
  private _type?: 'and' | 'or';
  private _inversed = false;

  protected readonly predicates: ObjectPredicate<Context>[] = [];

  and(predicate: Predicate<Context>): this {
    if (this._type === 'or') {
      throw new Error('Cannot add AND conditions to OR-group');
    }

    this._type = 'and';
    return this._pushPredicate(predicate);
  }

  or(predicate: Predicate<Context>): this {
    if (this._type === 'and') {
      throw new Error('Cannot add OR conditions to AND-group');
    }

    this._type = 'or';
    return this._pushPredicate(predicate);
  }

  not(): this {
    this._inversed = !this._inversed;
    return this;
  }

  _pushPredicate(predicate: Predicate<Context>): this {
    const predicateObject = new ObjectPredicateWrapper<Context>(
      predicate,
      true,
    );

    this.predicates.push(predicateObject);
    return this;
  }

  appliesTo(intermediate: Intermediate<Context>): boolean {
    let p: ObjectPredicate<Context>;
    let i: number;

    const n = this.predicates.length;
    for (i = 0; i < n; i++) {
      p = this.predicates[i];
      if (p.appliesTo(intermediate) === this._inversed) {
        return false;
      }
    }

    return true;
  }
}
