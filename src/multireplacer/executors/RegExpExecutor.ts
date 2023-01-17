import { Executor } from './Executor';
import { Intermediate } from '../Intermediate';
import { Replacement } from '../Replacement';

type ReplacementValue = string | ((match: string, ...args: any[]) => string);

export class RegExpExecutor<T> implements Executor<T> {
  constructor(
    protected readonly regexp: RegExp,
    protected readonly replacements: Replacement<ReplacementValue, T>[],
  ) {}

  protected readonly sticky = this._cloneRegexp('y');
  protected readonly global = this._cloneRegexp('g');

  execute(origin: Intermediate<T>): Intermediate<T>[] {
    const lastIndices = new Map<Intermediate, number>();
    const queue: Intermediate<T>[] = [origin];
    const results: Intermediate<T>[] = [];
    let intermediate: Intermediate<T> | undefined;

    while ((intermediate = queue.shift())) {
      this.global.lastIndex = lastIndices.get(intermediate) || 0;

      const intermediateValue = intermediate.value;
      const intermediateValueLength = intermediateValue.length;
      const match = this.global.exec(intermediateValue);
      if (!match) {
        results.push(intermediate);
        continue;
      }

      for (const replacement of this.replacements) {
        this.sticky.lastIndex = match.index;
        const newValue = intermediateValue.replace(
          this.sticky,
          replacement.value as any,
        );
        const newValueLength = newValue.length;
        const newIntermediate = new Intermediate(
          newValue,
          intermediate,
          replacement,
        );

        lastIndices.set(
          newIntermediate,
          this.sticky.lastIndex + newValueLength - intermediateValueLength,
        );
        queue.push(newIntermediate);
      }

      if (queue.length > 1000) {
        this._throwSafeguardError();
      }
    }

    return results;
  }

  indexOf(replacement: Replacement<unknown, T>): number {
    return this.replacements.indexOf(replacement as Replacement<string, T>);
  }

  _throwSafeguardError(): never {
    throw new Error(
      'High chance of infinite loop detected in the rule: ' + this.regexp,
    );
  }

  private _cloneRegexp(extraFlags: string) {
    const withoutGY = this.regexp.flags.replace('g', '').replace('y', '');

    return new RegExp(
      this.regexp,
      [...new Set([...withoutGY, ...extraFlags])].join(''),
    );
  }
}
