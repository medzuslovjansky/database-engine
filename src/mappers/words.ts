import { attempt, isError } from 'lodash';
import { parse as steenparse } from '@interslavic/steen-utils';
import { WordsDTO, WordsDTOOptionalLangs } from '../types';

const optionalLanguageCodes: Array<keyof WordsDTOOptionalLangs> = [
  'en',
  'ru',
  'be',
  'uk',
  'pl',
  'cs',
  'sk',
  'bg',
  'mk',
  'sr',
  'hr',
  'sl',
  'cu',
  'de',
  'nl',
  'eo',
];

export function mapWords(raw: Record<string, string>): WordsDTO {
  const partOfSpeech = steenparse.partOfSpeech(raw.partOfSpeech);
  const isPhrase = partOfSpeech.name === 'phrase';

  const voteStatus = attempt(() => steenparse.voteStatus(raw.type));

  const record: WordsDTO = {
    id: (raw.id || '').trim(),
    isv: steenparse.synset(raw.isv, { isPhrase }),
    addition: raw.addition,
    partOfSpeech,
    type: isError(voteStatus) ? undefined : voteStatus,
    sameInLanguages: steenparse.sameInLanguages(raw.sameInLanguages),
    genesis: raw.genesis ? steenparse.genesis(raw.genesis) : undefined,
    frequency: raw.frequency,
    using_example: raw.using_example,
  };

  for (const code of optionalLanguageCodes) {
    if (raw[code]) {
      record[code] = steenparse.synset(raw[code], { isPhrase });
    }
  }

  return record;
}
