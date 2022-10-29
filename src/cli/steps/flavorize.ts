import {
  FlavorizationRecord,
  Raw,
  TranslationRecord,
} from '../../types/tables';
import { NATURAL_LANGUAGES } from '../../utils/constants';
import { leftJoin } from '../../utils/sql';

export function* flavorize(
  translations: Raw<TranslationRecord>[],
  flavorizations: Raw<FlavorizationRecord>[],
  langs: Array<keyof typeof NATURAL_LANGUAGES>,
): IterableIterator<Raw<FlavorizationRecord>> {
  const extractId = (r: Record<string, unknown>) => r.id as string;
  for (const results of leftJoin(extractId, translations, flavorizations)) {
    const t = results[0];
    const f: Raw<FlavorizationRecord> = results[1] || {
      id: t.id,
      isv: t.isv,
      addition: t.addition,
      partOfSpeech: t.partOfSpeech,
      frequency: t.frequency,
      en: t.en,
      ru: '!',
      be: '!',
      uk: '!',
      pl: '!',
      cs: '!',
      sk: '!',
      bg: '!',
      mk: '!',
      sr: '!',
      hr: '!',
      sl: '!',
    };

    for (const lang of langs) {
      console.log(`${t.id} ${lang} ${t[lang]} ${f[lang]}`);
    }

    yield f;
  }
}
