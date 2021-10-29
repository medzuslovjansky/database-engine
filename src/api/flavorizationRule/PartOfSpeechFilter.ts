import _ from 'lodash';
import { parse as steenparse } from '@interslavic/steen-utils';
import { PartOfSpeech } from '@interslavic/steen-utils/types';
import { MultireplacerPredicateObject } from '@interslavic/odometer';
import { FlavorizationContext } from '../common/FlavorizationContext';
import { FlavorizationIntermediate } from '../flavorizationTable/FlavorizationIntermediate';

export class PartOfSpeechFilter
  implements MultireplacerPredicateObject<FlavorizationContext>
{
  constructor(public value: PartOfSpeech, public negated: boolean) {}

  public toString() {
    const sign = this.negated ? '!' : '';
    return sign + this.value;
  }

  public static parse(value: string): PartOfSpeechFilter | null {
    if (!value || value.startsWith('*')) {
      return null;
    }

    const negated = value.startsWith('!');
    const actualPartOfSpeech = negated ? value.slice(1) : value;
    const partOfSpeech = _.pickBy(
      steenparse.partOfSpeech(actualPartOfSpeech),
      _.identity,
    ) as PartOfSpeech;

    return new PartOfSpeechFilter(partOfSpeech, negated);
  }

  appliesTo({ context }: FlavorizationIntermediate): boolean {
    return this.value
      ? _.isMatch(context.partOfSpeech, this.value) !== this.negated
      : true;
  }
}
