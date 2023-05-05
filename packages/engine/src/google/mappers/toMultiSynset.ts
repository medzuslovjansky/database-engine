import {
  InterslavicSynset,
  MultilingualSynset,
  Synset,
} from '@interslavic/database-engine-core';

import type { WordsDTO } from '../dto';

export function toMultiSynset(value: WordsDTO): MultilingualSynset {
  const multilingualSynset = new MultilingualSynset();

  multilingualSynset.id = +value.id;

  multilingualSynset.synsets.isv = InterslavicSynset.parse(value.isv);
  for (const lemma of multilingualSynset.synsets.isv.lemmas) {
    lemma.steen = {
      id: +value.id,
      addition: value.addition || undefined,
      partOfSpeech: value.partOfSpeech,
      type: value.type ? Number(value.type) : undefined,
      sameInLanguages: value.sameInLanguages || undefined,
      genesis: value.genesis || undefined,
      frequency: value.frequency
        ? Number(`${value.frequency}`.replace(',', '.'))
        : undefined,
      using_example: value.using_example || undefined,
    };
  }

  multilingualSynset.synsets.be = maybeParseSynset(value.be);
  multilingualSynset.synsets.bg = maybeParseSynset(value.bg);
  multilingualSynset.synsets.cs = maybeParseSynset(value.cs);
  multilingualSynset.synsets.cu = maybeParseSynset(value.cu);
  multilingualSynset.synsets.de = maybeParseSynset(value.de);
  multilingualSynset.synsets.eo = maybeParseSynset(value.eo);
  multilingualSynset.synsets.hr = maybeParseSynset(value.hr);
  multilingualSynset.synsets.mk = maybeParseSynset(value.mk);
  multilingualSynset.synsets.nl = maybeParseSynset(value.nl);
  multilingualSynset.synsets.pl = maybeParseSynset(value.pl);
  multilingualSynset.synsets.ru = maybeParseSynset(value.ru);
  multilingualSynset.synsets.sk = maybeParseSynset(value.sk);
  multilingualSynset.synsets.sl = maybeParseSynset(value.sl);
  multilingualSynset.synsets.sr = maybeParseSynset(value.sr);
  multilingualSynset.synsets.uk = maybeParseSynset(value.uk);

  return multilingualSynset;
}

function maybeParseSynset(str: string): Synset | undefined {
  if (!str) {
    return undefined;
  }

  const synset = Synset.parse(str);
  if (synset.lemmas.length === 0) {
    return undefined;
  }

  return synset;
}
