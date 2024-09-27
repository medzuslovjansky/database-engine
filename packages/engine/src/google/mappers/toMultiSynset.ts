import {
  Synset,
  InterslavicSynset,
  MultilingualSynset,
} from '@interslavic/database-engine-core';

import type { WordsAddLangRecord, WordsRecord } from '../dto';

export function toMultiSynset(dto: WordsRecord): MultilingualSynset {
  const multilingualSynset = new MultilingualSynset();

  const debated = new Set<keyof WordsRecord>();
  const dtoAny = dto as any;
  for (const key of Object.keys(dto)) {
    const value = `${dtoAny[key]}`.trimStart();
    if (value.startsWith('#')) {
      debated.add(key as keyof WordsRecord);
      dtoAny[key] = value.slice(1);
    }
  }

  if (debated.size > 0) {
    multilingualSynset.steen = { debated };
  }

  const id = Math.abs(+dto.id);
  multilingualSynset.id = id;

  multilingualSynset.synsets.isv = InterslavicSynset.parse(dto.isv);
  for (const lemma of multilingualSynset.synsets.isv.lemmas) {
    lemma.steen = {
      id,
      addition: dto.addition || undefined,
      partOfSpeech: dto.partOfSpeech,
      type: dto.type ? Number(dto.type) : undefined,
      sameInLanguages: dto.sameInLanguages?.trim() || undefined,
      genesis: dto.genesis || undefined,
      frequency: dto.frequency
        ? Number(`${dto.frequency}`.replace(',', '.'))
        : undefined,
      using_example: dto.using_example || undefined,
    };
  }

  multilingualSynset.synsets.en = maybeParseSynset(dto.en);
  multilingualSynset.synsets.be = maybeParseSynset(dto.be);
  multilingualSynset.synsets.bg = maybeParseSynset(dto.bg);
  multilingualSynset.synsets.cs = maybeParseSynset(dto.cs);
  multilingualSynset.synsets.cu = maybeParseSynset(dto.cu);
  multilingualSynset.synsets.de = maybeParseSynset(dto.de);
  multilingualSynset.synsets.eo = maybeParseSynset(dto.eo);
  multilingualSynset.synsets.hr = maybeParseSynset(dto.hr);
  multilingualSynset.synsets.mk = maybeParseSynset(dto.mk);
  multilingualSynset.synsets.nl = maybeParseSynset(dto.nl);
  multilingualSynset.synsets.pl = maybeParseSynset(dto.pl);
  multilingualSynset.synsets.ru = maybeParseSynset(dto.ru);
  multilingualSynset.synsets.sk = maybeParseSynset(dto.sk);
  multilingualSynset.synsets.sl = maybeParseSynset(dto.sl);
  multilingualSynset.synsets.sr = maybeParseSynset(dto.sr);
  multilingualSynset.synsets.uk = maybeParseSynset(dto.uk);

  return multilingualSynset;
}

export function mergeToSynset(
  multilingualSynset: MultilingualSynset,
  dto: WordsAddLangRecord,
): void {
  multilingualSynset.synsets.csb = maybeParseSynset(dto.csb);
  multilingualSynset.synsets.dsb = maybeParseSynset(dto.dsb);
  multilingualSynset.synsets.hsb = maybeParseSynset(dto.hsb);
  multilingualSynset.synsets.ia = maybeParseSynset(dto.ia);
  multilingualSynset.synsets.es = maybeParseSynset(dto.es);
  multilingualSynset.synsets.pt = maybeParseSynset(dto.pt);
  multilingualSynset.synsets.fr = maybeParseSynset(dto.fr);
  multilingualSynset.synsets.it = maybeParseSynset(dto.it);
  multilingualSynset.synsets.he = maybeParseSynset(dto.he);
  multilingualSynset.synsets.da = maybeParseSynset(dto.da);
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
