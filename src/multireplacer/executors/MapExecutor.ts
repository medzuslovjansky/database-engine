import upperFirst from 'lodash/upperFirst';
import { Executor } from './Executor';
import { Intermediate } from '../Intermediate';
import { Replacement } from '../Replacement';

export class MapExecutor<T> implements Executor<T> {
  protected readonly maxLength: number;
  protected readonly map: Map<string, string>;

  constructor(
    protected readonly replacement: Replacement<Record<string, string>, T>,
    autoCapitalize = false,
  ) {
    this.map = new Map<string, string>(Object.entries(replacement.value));
    this.maxLength = Math.max(
      ...Object.keys(replacement.value).map((k) => k.length),
    );

    if (autoCapitalize) {
      this._autoCapitalizeMappings();
    }
  }

  indexOf(replacement: Replacement<unknown, T>): number {
    return this.replacement === replacement ? 0 : -1;
  }

  public execute(origin: Intermediate<T>): Intermediate<T>[] {
    if (this.maxLength < 1) {
      return [origin];
    }

    const str = origin.value;

    let result = '';
    let worked = false;
    for (let i = 0; i < str.length; i++) {
      for (let l = this.maxLength; l >= 0; l--) {
        if (l > 0) {
          const chunk = str.substr(i, l);
          const transliteratedChunk = this.map.get(chunk);
          if (transliteratedChunk !== undefined) {
            worked = true;
            result += transliteratedChunk;
            i += l - 1;
            break;
          }
        } else {
          result += str[i];
        }
      }
    }

    return worked
      ? [new Intermediate(result, origin, this.replacement)]
      : [origin];
  }

  private _autoCapitalizeMappings(): void {
    const kv = [...this.map.entries()];
    for (const [key, value] of kv) {
      const capitalized = upperFirst(key);
      if (!this.map.has(capitalized)) {
        this.map.set(capitalized, upperFirst(value));
      }
    }
  }
}
