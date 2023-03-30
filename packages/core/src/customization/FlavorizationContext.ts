import { types } from '@interslavic/steen-utils';

export type FlavorizationContext = {
  genesis?: keyof typeof types.Genesis;
  partOfSpeech?: types.PartOfSpeech;
};
