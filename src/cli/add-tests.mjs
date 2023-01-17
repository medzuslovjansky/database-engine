// import 'zx/globals';
// import vm from 'node:vm';
// import _ from 'lodash';
// import { LANGS } from "../utils/constants.ts";
// import * as csv from '../utils/csv.ts';
// import razumlivost from '../../dist';
// import findMatchingBracket from 'find-matching-bracket';
// import { parse } from "@interslavic/steen-utils";
//
// const fingerprints = razumlivost.fingerprints;
//
// const TEST_CASES_MARKER = '.each([';
//
// await main('pl');
//
// async function main(targetLang) {
//   const words = await csv.parseFile(`__fixtures__/words.csv`);
//
//   for (const lang of (targetLang ? [targetLang] : LANGS)) {
//     const testFilePath = `src/__tests__/fingerprints-${lang}.ts`;
//     console.log(`Replenishing test cases in: ${chalk.yellow(testFilePath)}`);
//     const testContents = await fs.readFile(testFilePath, 'utf8');
//
//     const testCasesSlice = cutCodeBlock(testContents, TEST_CASES_MARKER, 0);
//     const hashStorage = new Set();
//     const hashIt = (testCase) => {
//       const size = hashStorage.size;
//       const isvForm = testCase[1].trim().toLowerCase();
//       hashStorage.add(isvForm + '\t' + testCase[3].trim().toLowerCase());
//       return hashStorage.size === size;
//     }
//
//     const testCases = vm.runInNewContext(testCasesSlice.code);
//     testCases.forEach(x => x.unshift(0));
//     testCases.forEach(hashIt);
//
//     const skippedTestCases = [];
//
//     const flavorizerISV = fingerprints[lang].isv();
//     const flavorizerLang = fingerprints[lang][lang]();
//
//     for (const word of words) {
//       const langFingerprint = flavorizerLang.flavorize(word[lang], word.partOfSpeech, word.genesis);
//       const isvFingerprint = flavorizerISV.flavorize(word.isv, word.partOfSpeech, word.genesis);
//
//       const absoluteMatches1 = flavorizerISV
//         .compareDebug(word, word.isv, langFingerprint.join(', '))
//         .filter(m => m.distance.absolute === 0);
//
//       const absoluteMatches2 = flavorizerLang
//         .compareDebug(word, word[lang], isvFingerprint.join(', '))
//         .filter(m => m.distance.absolute === 0);
//
//       const absoluteMatches = absoluteMatches1.length === 1 && absoluteMatches2.length === 1
//         ? [{
//           source: absoluteMatches1[0].source,
//           target: absoluteMatches2[0].source,
//           distance: absoluteMatches2[0].distance
//         }]
//         : [];
//
//       for (const match of absoluteMatches) {
//         const testCase = [
//           match.distance.absolute,
//           match.source.root.value,
//           match.target.root.value,
//           word.partOfSpeech,
//           word.genesis
//         ];
//
//         testCases.push(testCase);
//       }
//     }
//
//     testCases.sort(compareTestCases);
//     skippedTestCases.sort(compareTestCases);
//
//     const update1 = testCasesSlice.replace(testCases.map(linearizeTestCase).join(''));
//     // const skippedTestCasesSlice = cutCodeBlock(update1, TEST_CASES_MARKER, testCasesSlice.start + 1);
//     // const update2 = skippedTestCasesSlice.replace(skippedTestCases.map(linearizeTestCase).join(''));
//     await fs.writeFile(testFilePath, update1);
//   }
// }
//
// function cutCodeBlock(str, blockStart, startPos) {
//   const start = str.indexOf(blockStart, startPos) + blockStart.length - 1;
//   const end = findMatchingBracket.default(str, start, true);
//   const code = str.slice(start, end + 1);
//
//   return {
//     start,
//     end,
//     code,
//     replace(value) {
//       const lastNewLine = str.lastIndexOf('\n', end);
//       return (str.slice(0, start + 1) + '\n'
//         + value
//         + str.slice(lastNewLine + 1));
//     }
//   };
// }
//
// function linearizeTestCase(testCase) {
//   const arrayContents = testCase.slice(1).map(v => {
//     const s = `${v}`;
//     if (s.includes("'") || s.includes('\n')) {
//       return `"${v}"`;
//     } else {
//       return `'${v}'`;
//     }
//   }).join(', ')
//
//   const indent = ' '.repeat(4) + (testCase[0] === 0 ? '' : '// ');
//   return indent + `[${arrayContents}],\n`;
// }
//
// function compareTestCases(a, b) {
//   if (a[0] !== b[0]) return a[0] - b[0];
//   if (a[1] !== b[1]) return a[1].localeCompare(b[1], 'sk');
//   if (a[2] !== b[2]) return a[2].localeCompare(b[2], 'sk');
//   if (a[3] !== b[3]) return a[3].localeCompare(b[3]);
//   return a[4].localeCompare(b[4]);
// }
