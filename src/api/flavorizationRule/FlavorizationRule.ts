import { FlavorizationRuleDTO } from '../../dto';
import { FlavorizationContext } from '../common/FlavorizationContext';
import createMapReplacer from './createMapReplacer';
import { FlavorizationLevelSet } from './FlavorizationLevelSet';
import { GenesisFilter } from './GenesisFilter';
import { PartOfSpeechFilter } from './PartOfSpeechFilter';
import {
  FunctionExecutor,
  Intermediate,
  MapExecutor,
  RegExpExecutor,
  Rule,
} from '@interslavic/odometer';

export class FlavorizationRule extends Rule<FlavorizationContext> {
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

    switch (dto.modifiers) {
      case 'regexp':
        this.executor = new RegExpExecutor(
          new RegExp(dto.match),
          dto.replacements.map((r) => this.authorReplacement(r)),
        );
        break;
      case 'map':
        this.executor = new MapExecutor(
          this.authorReplacement(createMapReplacer(dto.match)),
        );
        break;
      case 'lowerCase':
        this.executor = new FunctionExecutor(
          this.authorReplacement((r: Intermediate) => [r.value.toLowerCase()]),
        );
        break;
    }
  }
}
