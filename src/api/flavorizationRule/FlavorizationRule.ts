import { MultireplacerRule, Splitters } from '@interslavic/odometer';
import { FlavorizationRuleDTO } from '../../dto';
import { FlavorizationContext } from '../common/FlavorizationContext';
import createMapReplacer from './createMapReplacer';
import { FlavorizationLevelSet } from './FlavorizationLevelSet';
import { GenesisFilter } from './GenesisFilter';
import { PartOfSpeechFilter } from './PartOfSpeechFilter';
import { RuleModifiers } from './RuleModifiers';

export class FlavorizationRule extends MultireplacerRule<FlavorizationContext> {
  public levels: FlavorizationLevelSet;

  constructor(dto: FlavorizationRuleDTO) {
    if (!dto.name) {
      throw new Error('The rule has no defined name');
    }

    if (!dto.match) {
      throw new Error('The rule lacks match pattern');
    }

    super(dto.name);

    this.levels = FlavorizationLevelSet.parse(dto.flavorizationLevel);

    const genesis = GenesisFilter.parse(dto.genesis);
    if (!genesis.isEmpty) {
      this.predicates.and(genesis);
    }

    const partOfSpeech = PartOfSpeechFilter.parse(dto.partOfSpeech);
    if (partOfSpeech) {
      this.predicates.and(partOfSpeech);
    }

    const modifiers = RuleModifiers.parse(dto.modifiers);

    if (modifiers.case) {
      const fn =
        modifiers.case === 'upper'
          ? (s: string) => s.toUpperCase()
          : (s: string) => s.toLowerCase();

      this.searchValue = /^.*$/;
      this.replacements.add(fn);
    } else {
      this.searchValue = modifiers.fixed
        ? dto.match
        : new RegExp(dto.match, 'g');

      switch (modifiers.split) {
        case 'by-word':
          this.splitter = Splitters.word;
          break;
        case 'by-letter':
          this.splitter = Splitters.letter;
          break;
      }

      for (const replacement of dto.replacements) {
        if (modifiers.map) {
          this.replacements.add(createMapReplacer(replacement));
        } else {
          this.replacements.add(replacement);
        }
      }
    }
  }
}
