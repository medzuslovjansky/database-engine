import {
  AnalysisRecord,
  FlavorizationRecord,
  Raw,
  TranslationRecord,
} from '../../types/tables';
import { NATURAL_LANGUAGES } from '../../utils/constants';
import { leftJoin } from '../../utils/sql';

export function* analyze(
  translations: Raw<TranslationRecord>[],
  flavorizations: Raw<FlavorizationRecord>[],
  analysises: Raw<AnalysisRecord>[],
  lang: keyof typeof NATURAL_LANGUAGES,
): IterableIterator<Raw<AnalysisRecord>> {
  const extractId = (r: Record<string, unknown>) => r.id as string;
  for (const results of leftJoin(
    extractId,
    translations,
    flavorizations,
    analysises,
  )) {
    const t = results[0];
    const f = results[1];
    if (!f) {
      throw new Error(`No flavorization for ID = ${t.id}`);
    }

    const a = results[2] || {
      id: t.id,
      isv: t.isv,
      translationOriginal: t[lang],
      translationCorrection: '',
      translationMatch: '!',
      helperWords: '!',
      falseFriends: '!',
    };

    yield a;
  }
}
