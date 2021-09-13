import { Genesis } from '@interslavic/steen-utils/types';
import { parse as steenparse } from '@interslavic/steen-utils';

export class FlavorizationRuleGenesisFilter {
  public approximate = false;
  public negated = false;
  public readonly values = new Set<keyof typeof Genesis>();

  public get isEmpty() {
    return this.values.size === 0;
  }

  public toString() {
    return [
      this.negated ? '!' : '',
      this.approximate ? '?' : '',
      ...[...this.values].map((s) => Genesis[s]),
    ].join('');
  }

  public static parse(value: string): FlavorizationRuleGenesisFilter {
    const result = new FlavorizationRuleGenesisFilter();

    if (value) {
      for (const letter of value.split('')) {
        switch (letter) {
          case '?':
            result.approximate = true;
            continue;
          case '!':
            result.negated = true;
            continue;
          default:
            result.values.add(steenparse.genesis(letter));
        }
      }
    }

    return result;
  }

  public static readonly none = Object.freeze(
    new FlavorizationRuleGenesisFilter(),
  );
}
