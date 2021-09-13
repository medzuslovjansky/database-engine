import { core } from '@interslavic/steen-utils';
import {
  CrudeIntelligibilityReport,
  Genesis,
  PartOfSpeech,
  VoteStatus,
} from '@interslavic/steen-utils/types';

export type WordsDTOOptionalLangs = {
  en?: core.Synset;
  ru?: core.Synset;
  be?: core.Synset;
  uk?: core.Synset;
  pl?: core.Synset;
  cs?: core.Synset;
  sk?: core.Synset;
  bg?: core.Synset;
  mk?: core.Synset;
  sr?: core.Synset;
  hr?: core.Synset;
  sl?: core.Synset;
  cu?: core.Synset;
  de?: core.Synset;
  nl?: core.Synset;
  eo?: core.Synset;
};

export type WordsDTO = {
  id: string;
  isv: core.Synset;
  addition: string;
  partOfSpeech: PartOfSpeech;
  type?: keyof typeof VoteStatus;
  sameInLanguages: CrudeIntelligibilityReport;
  genesis?: keyof typeof Genesis;
  frequency?: string;
  using_example?: string;
} & WordsDTOOptionalLangs;
