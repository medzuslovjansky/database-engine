import { FlavorizationRuleGenesisFilter } from './FlavorizationRuleGenesisFilter';
import { FlavorizationRulePartOfSpeechFilter } from './FlavorizationRulePartOfSpeechFilter';
import { FlavorizationRuleModifiers } from './FlavorizationRuleModifiers';
import { FlavorizationLevelSet } from './FlavorizationLevelSet';

export class FlavorizationRuleDTO {
  public disabled = false;
  public name = '';
  public flavorizationLevel = new FlavorizationLevelSet();
  public match = '';
  public modifiers = FlavorizationRuleModifiers.none;
  public partOfSpeech = FlavorizationRulePartOfSpeechFilter.none;
  public genesis = FlavorizationRuleGenesisFilter.none;
  public readonly replacements: string[] = [];

  public toString() {
    if (this.disabled) {
      return `#${this.name}`;
    }

    return `${this.name} (${this.match})`;
  }
}
