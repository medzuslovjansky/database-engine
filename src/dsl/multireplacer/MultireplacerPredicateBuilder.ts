import { Predicate } from '../../multireplacer';
import { GenesisFilter, PartOfSpeechFilter } from '../../customization';

export class MultireplacerPredicateBuilder {
  predicates: Predicate<any>[] = [];

  partOfSpeech(serialized: string) {
    const partOfSpeech = PartOfSpeechFilter.parse(serialized);
    if (partOfSpeech) {
      this.predicates.push(partOfSpeech);
    }

    return this;
  }

  genesis(serialized: string) {
    const genesis = GenesisFilter.parse(serialized);
    if (!genesis.isEmpty) {
      this.predicates.push(genesis);
    }

    return this;
  }

  and(_builder: MultireplacerPredicateBuilder) {
    return this;
  }
}
