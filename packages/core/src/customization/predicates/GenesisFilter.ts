import {
  parse as steenparse,
  types as steentypes,
} from '@interslavic/steen-utils';
import { ObjectPredicate } from '../../multireplacer';
import { FlavorizationIntermediate } from '../FlavorizationIntermediate';
import { FlavorizationContext } from '../FlavorizationContext';

export class GenesisFilter implements ObjectPredicate<FlavorizationContext> {
  public approximate = false;
  public negated = false;
  public readonly values = new Set<keyof typeof steentypes.Genesis>();

  public get isEmpty() {
    return this.values.size === 0;
  }

  public toString() {
    return [
      this.negated ? '!' : '',
      this.approximate ? '?' : '',
      ...[...this.values].map((s) => steentypes.Genesis[s]),
    ].join('');
  }

  public static parse(value: string): GenesisFilter {
    const result = new GenesisFilter();

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

  public static readonly none = Object.freeze(new GenesisFilter());

  public appliesTo({ context }: FlavorizationIntermediate): boolean {
    if (this.negated) {
      if (this.approximate) {
        return !context.genesis || !this.values.has(context.genesis);
      } else {
        return !!context.genesis && !this.values.has(context.genesis);
      }
    } else {
      if (this.approximate) {
        return !context.genesis || this.values.has(context.genesis);
      } else {
        return !!context.genesis && this.values.has(context.genesis);
      }
    }
  }
}
