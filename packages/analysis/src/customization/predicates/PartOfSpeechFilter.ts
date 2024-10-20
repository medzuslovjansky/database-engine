import { identity, isMatch, pickBy }from 'lodash';
import { parse as steenparse } from '@interslavic/steen-utils';
import type { PartOfSpeech } from '@interslavic/steen-utils/types';

import type { ObjectPredicate } from '../../multireplacer';
import type { FlavorizationContext } from '../FlavorizationContext';
import type { FlavorizationIntermediate } from '../FlavorizationIntermediate';

export class PartOfSpeechFilter
  implements ObjectPredicate<FlavorizationContext>
{
  constructor(public values: PartOfSpeech[], public negated: boolean) {}

  public toString() {
    const sign = this.negated ? '!' : '';
    return sign + this.values.join(', ');
  }

  public static parse(value: string): PartOfSpeechFilter | null {
    if (!value || value.startsWith('*')) {
      return null;
    }

    const negated = value.startsWith('!');
    const actualPartsOfSpeech = (negated ? value.slice(1) : value).split(
      /\s*,\s*/,
    );
    const partsOfSpeech = actualPartsOfSpeech.map(
      (p) => pickBy(steenparse.partOfSpeech(p), identity) as PartOfSpeech,
    );

    return new PartOfSpeechFilter(partsOfSpeech, negated);
  }

  appliesTo({ context }: FlavorizationIntermediate): boolean {
    const pos = context.partOfSpeech;
    return this.values.length > 0 && pos
      ? this.values.some((v) => isMatch(pos, v) !== this.negated)
      : false;
  }
}
