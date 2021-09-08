import { BareRecord } from '../types/BareRecord';
import { parse as steenparse } from '@interslavic/steen-utils';
import { parseCSV } from './parseCSV';

export async function parseVocabulary(
  isv: Buffer | string,
  lang: Buffer | string,
): Promise<BareRecord[]> {
  const rawIsv = await parseCSV(isv);
  const rawLang = await parseCSV(lang, ';');

  const translations = new Map(rawLang.map((r) => [+r.id, r.translation]));

  return rawIsv.map<BareRecord>((r) => {
    const id = +r.id;
    const partOfSpeech = steenparse.partOfSpeech(r.partOfSpeech);
    const genesis = r.etymology ? steenparse.genesis(r.etymology) : undefined;
    const isPhrase = partOfSpeech.name === 'phrase';
    const isv = steenparse.synset(r.lemma.toLowerCase(), { isPhrase });
    const rawTranslation = translations.get(id);
    const translation = rawTranslation
      ? steenparse.synset(rawTranslation.toLowerCase(), {
          isPhrase,
        })
      : undefined;

    return {
      id,
      isv,
      translation,
      partOfSpeech,
      genesis,
    };
  });
}
