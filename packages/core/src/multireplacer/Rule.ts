import { PredicateGroup } from './predicates';
import { Intermediate } from './Intermediate';
import { IntermediatesCache } from './internal/IntermediatesCache';
import { Executor } from './executors/Executor';
import { Replacement } from './Replacement';

export class Rule<Context> {
  private _intermediatesCache: IntermediatesCache<Context> | null = null;
  private readonly _ownedReplacements = new Map<
    unknown,
    Replacement<unknown, Context>
  >();

  public executor: Executor<Context> | null = null;
  public readonly predicates = new PredicateGroup<Context>();

  constructor(public readonly name: string) {}

  public authorReplacement<T>(value: T): Replacement<T, Context> {
    const existing = this._ownedReplacements.get(value);
    if (existing) {
      return existing as Replacement<T, Context>;
    }

    const replacement = new Replacement(this, value);
    this._ownedReplacements.set(value, replacement);
    return replacement;
  }

  public get replacements(): Replacement<unknown, Context>[] {
    return [...this._ownedReplacements.values()];
  }

  public useCache(cache: IntermediatesCache<Context> | null): void {
    this._intermediatesCache = cache;
  }

  public indexOf(replacement: Replacement<unknown, Context>): number {
    if (!this.executor) {
      this._throwMissingExecutor();
    }

    return this.executor.indexOf(replacement);
  }

  public apply(intermediate: Intermediate<Context>): Intermediate<Context>[] {
    if (!this.executor) {
      this._throwMissingExecutor();
    }

    if (!this.predicates.appliesTo(intermediate)) {
      return [intermediate];
    }

    const results = this.executor.execute(intermediate);
    if (this._intermediatesCache) {
      for (const result of results) {
        this._intermediatesCache.add(result);
      }
    }

    return results;
  }

  private _throwMissingExecutor(): never {
    throw new Error(`The rule ${this.name} was not properly initialized`);
  }
}
