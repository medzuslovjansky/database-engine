import type {
  AnalysisRecord,
  FlavorizationRecord,
  Raw,
  Lemma,
  NATURAL_LANGUAGES,
} from '@interslavic/database-engine-core';

import { leftJoin } from './sql';

export function* analyze(
  translations: Raw<Lemma>[],
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

// import 'zx/globals';
//
// import _ from "lodash";
// import { core, parse, types } from "@interslavic/steen-backup";
//
// import razumlivost from '../../dist';
//
// import { LANGS } from "../backup/constants.ts";
// import * as csv from '../backup/csv.ts';
// import { updateSameInLanguages } from './google-spreadsheets.ts';
// import { loadDictionary } from "../backup/hunspell.ts";
//
// const odometer = new razumlivost.Odometer({
//   ignoreCase: true,
//   ignoreNonLetters: true,
//   ignoreDiacritics: true,
//   extractValue: lemma => lemma.value.replace(/(\p{Letter})\1+/gu, '$1'),
// });
//
// const flavorizers = razumlivost.flavorizers.slow;
// const quickFlavorizers = razumlivost.flavorizers.quick;
//
// await fs.mkdirp('__fixtures__/analysis');
// await main('uk'); // process.argv[3]);
//
// async function main(targetLang) {
//   const { map: words, list: wordsList } = await parseNewInterslavicWordsList();
//   for (const lang of (targetLang ? [targetLang] : LANGS)) {
//     console.log(`Analysing language: ${chalk.yellow(lang)}`);
//
//     const hunspell = await loadDictionary(lang);
//     const records = await parseIntelligiblitySheet(words, lang);
//
//     let i = 0;
//     for (const word of Object.values(words)) {
//       console.log(`Processed ${i++} words.`);
//
//       const record = records[word.id] || {
//         id: word.id,
//         isv: word.isv,
//         translationOriginal: word[lang],
//         translationCorrection: new core.Synset({ autogenerated: false }),
//         translationMatch: new core.Synset(),
//         helperWords: new core.Synset(),
//         falseFriends: new core.Synset(),
//         flavorization: new core.Synset(),
//       };
//
//       const slow = flavorizers[lang];
//       const quick = quickFlavorizers[lang];
//       const translation = record.translationCorrection.empty
//         ? record.translationOriginal
//         : record.translationCorrection;
//
//       if (record.flavorization.meta.autogenerated) {
//         let flavorization;
//         try {
//           flavorization = slow.flavorize(word, record.isv);
//         } catch (e) {
//           console.log(chalk.yellow(`Lemma #${record.id} failed: ${record.isv}`));
//           flavorization = quick.flavorize(word, record.isv);
//         }
//
//         let similar = odometer.compare(flavorization.lemmas(), translation.lemmas());
//
//         if (similar.editingDistancePercent >= 35) {
//           let fallback = [...flavorization.lemmas()].filter(l => hunspell.spellSync(l.value));
//           if (!fallback.length) {
//             fallback = [...quick.flavorize(word, word.isv).lemmas()];
//           }
//
//           similar = odometer.compare(fallback, translation.lemmas());
//         } else if (similar.editingDistancePercent === 0) {
//           record.flavorization.meta.autogenerated = false;
//         }
//
//         record.flavorization.clear().add(similar.query);
//       }
//
//       record.translationMatch = translation.intersection(
//         record.flavorization,
//         (a, b) => odometer.compare([a], [b]).editingDistancePercent <= 33
//       );
//
//       record.helperWords = record.helperWords.intersection(
//         record.flavorization,
//         (a, b) => odometer.compare([a], [b]).editingDistancePercent <= 33
//       );
//
//       record.helperWords = record.helperWords.difference(record.translationMatch);
//       if (record.helperWords.empty && !record.translationMatch.empty) {
//         record.helperWords.meta.autogenerated = false;
//       }
//
//       records[word.id] = {
//         id: record.id,
//         isv: word.raw.isv,
//         translationOriginal: word.raw[lang],
//         translationCorrection: record.translationCorrection.toString(),
//         translationMatch: record.translationMatch.toString(),
//         helperWords: record.helperWords.toString(),
//         falseFriends: record.falseFriends.toString(),
//         flavorization: record.flavorization.toString(),
//       };
//
//       updateIntelligibilityStatus(word, lang, record);
//     }
//
//     const sorted = _.sortBy(records, r => +r.id);
//     await csv.writeFile(`__fixtures__/analysis/${lang}.csv`, sorted);
//   }
//
//   for (const word of wordsList) {
//     word.raw.intelligibility = word.intelligibility.toString();
//   }
//
//   await csv.writeFile(`__fixtures__/words.csv`, wordsList.map(w => w.raw));
//
//   console.log('Almost there...');
//   await $`sleep 20`;
//   await updateSameInLanguages(wordsList.map(w => w.raw.intelligibility));
// }
//
// function updateIntelligibilityStatus(word, lang, record) {
//   /** @type {core.IntelligibilityAssessment} */
//   const assessment = word.intelligibility[lang];
//   const hasTranslation = !record.translationMatch.empty;
//   const hasHelperWords = record.helperWords.meta.autogenerated ? false : !record.helperWords.empty;
//   const hasFalseFriends = record.falseFriends.meta.autogenerated ? false : !record.falseFriends.empty;
//
//   assessment.autogenerated = record.translationMatch.meta.autogenerated;
//
//   if (hasTranslation) {
//     if (hasFalseFriends) {
//       assessment.level = types.IntelligibilityLevel.AmbiguousDirectMatch;
//     } else {
//       assessment.level = types.IntelligibilityLevel.DirectMatch;
//     }
//   } else if (hasHelperWords) {
//     if (hasFalseFriends) {
//       assessment.level = types.IntelligibilityLevel.AmbiguousHelperMatch;
//     } else {
//       assessment.level = types.IntelligibilityLevel.HelperMatch;
//     }
//   } else {
//     if (hasFalseFriends) {
//       assessment.level = types.IntelligibilityLevel.FalseFriend;
//     } else {
//       assessment.level = types.IntelligibilityLevel.NoMatch;
//     }
//   }
// }
//
// async function parseNewInterslavicWordsList() {
//   const rawWords = await csv.parseFile(`__fixtures__/words.csv`);
//
//   const words = rawWords.map((word) => {
//     const result = {};
//     result.raw = word;
//     result.id = word.id;
//     result.partOfSpeech = parse.partOfSpeech(word.partOfSpeech);
//     result.genesis = word.genesis ? parse.genesis(word.genesis) : undefined;
//     result.intelligibility = parse.sameInLanguages(word.intelligibility, false);
//
//     const isPhrase = word.partOfSpeech.name === 'phrase';
//     for (const lang of ['isv', ...LANGS]) {
//       result[lang] = parse.synset(word[lang] || '', { isPhrase })
//     }
//
//     return result;
//   });
//
//   return {
//     map: toPlainMap(words),
//     list: words,
//   };
// }
//
// async function parseIntelligiblitySheet(words, lang) {
//   const analysisPath = `__fixtures__/analysis/${lang}.csv`;
//   if (!analysisPath) {
//     return {};
//   }
//
//   const rawAnalysis = await csv.parseFile(analysisPath);
//   const analysis = rawAnalysis.map((record) => {
//     const { id } = record;
//     const opts = {
//       isPhrase: words[id].partOfSpeech.name === 'phrase',
//     };
//
//     return {
//       id,
//       isv: words[id].isv,
//       translationOriginal: words[id][lang],
//       translationCorrection: parse.synset(record.translationCorrection, opts),
//       translationMatch: parse.synset(record.translationMatch, opts),
//       helperWords: parse.synset(record.helperWords, opts),
//       falseFriends: parse.synset(record.falseFriends, opts),
//       flavorization: parse.synset(record.flavorization, opts),
//     };
//   });
//
//   return toPlainMap(analysis);
// }
//
// function toPlainMap(rows) {
//   return rows.reduce((map, row) => {
//     map[row.id] = row;
//     return map;
//   }, {});
// }
