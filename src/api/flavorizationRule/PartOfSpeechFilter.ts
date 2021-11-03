import _ from 'lodash';
import { parse as steenparse } from '@interslavic/steen-utils';
import { PartOfSpeech } from '@interslavic/steen-utils/types';
import { ObjectPredicate } from '@interslavic/odometer';
import { FlavorizationContext } from '../common/FlavorizationContext';
import { FlavorizationIntermediate } from '../flavorizationTable/FlavorizationIntermediate';

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
      (p) => _.pickBy(steenparse.partOfSpeech(p), _.identity) as PartOfSpeech,
    );

    return new PartOfSpeechFilter(partsOfSpeech, negated);
  }

  appliesTo({ context }: FlavorizationIntermediate): boolean {
    return this.values.length > 0
      ? this.values.some(
          (v) => _.isMatch(context.partOfSpeech, v) !== this.negated,
        )
      : true;
  }
}
