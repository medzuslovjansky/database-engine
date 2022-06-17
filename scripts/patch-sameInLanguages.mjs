import 'zx/globals';
import { LANGS } from "./utils/constants.mjs";
import * as csv from './utils/csv.mjs';

const NOT_EMPTY = /^[!#]*\p{Letter}/u;

await main();

async function main() {
  const WORDS_PATH = `__fixtures__/words.csv`;

  const intellgibility = {};
  const rawWords = await csv.parseFile(WORDS_PATH);
  for (const word of rawWords) {
    intellgibility[word.id] = {
      be: '',
      bg: '',
      cs: '',
      hr: '',
      mk: '',
      pl: '',
      ru: '',
      sk: '',
      sl: '',
      sr: '',
      uk: '',
    };
  }

  for (const lang of LANGS) {
    const rawAnalysis = await csv.parseFile(`__fixtures__/analysis/${lang}.csv`);
    for (const entry of rawAnalysis) {
      const irecord = intellgibility[entry.id];
      if (irecord) {
        irecord[lang] = formatShorthandReport(lang, entry);
      }
    }
  }

  for (const word of rawWords) {
    word.sameInLanguages = Object.values(intellgibility[word.id]).filter(Boolean).join(' ');
  }

  await csv.writeFile(WORDS_PATH, rawWords);
}

function formatShorthandReport(lang, { translationMatch, helperWords, falseFriends }) {
  const hasTranslation = NOT_EMPTY.test(translationMatch);
  const hasHelpers = NOT_EMPTY.test(helperWords);
  const hasFalseFriends = NOT_EMPTY.test(falseFriends);

  if (!hasTranslation && !hasHelpers && !hasFalseFriends) {
    return '';
  }

  const isAutomatic = (hasFalseFriends && falseFriends.startsWith('!')) || (
    hasTranslation
      ? translationMatch.startsWith('!')
      : hasHelpers && helperWords.startsWith('!')
  );

  const suffix = isAutomatic ? '!' : '';
  const prefix = hasFalseFriends
    ? (hasTranslation ? '~' : hasHelpers ? '?' : '#')
    : (hasTranslation ? '' : '~')

  return prefix + lang + suffix;
}
