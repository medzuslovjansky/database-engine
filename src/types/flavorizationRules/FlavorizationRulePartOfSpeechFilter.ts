import _ from 'lodash';
import { parse as steenparse } from '@interslavic/steen-utils';
import { PartOfSpeech } from '@interslavic/steen-utils/types';

export class FlavorizationRulePartOfSpeechFilter {
  public negated = false;
  public value: PartOfSpeech | null = null;

  public toString() {
    return this.value ? [this.negated ? '!' : '', this.value].join('') : '';
  }

  public static parse(value: string): FlavorizationRulePartOfSpeechFilter {
    const result = new FlavorizationRulePartOfSpeechFilter();
    if (!value || value.startsWith('*')) {
      return result;
    }

    result.negated = value.startsWith('!');
    const actualPartOfSpeech = result.negated ? value.slice(1) : value;
    result.value = _.pickBy(
      steenparse.partOfSpeech(actualPartOfSpeech),
      _.identity,
    ) as PartOfSpeech;

    return result;
  }

  public static readonly none = Object.freeze(
    new FlavorizationRulePartOfSpeechFilter(),
  );
}
