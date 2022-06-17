import 'zx/globals';
import vm from 'node:vm';
import { LANGS } from "./utils/constants.mjs";
import parseCSV from './utils/parseCSV.mjs';
import razumlivost from '../dist/index.js';
import findMatchingBracket from 'find-matching-bracket';

const flavorizers = razumlivost.flavorizers;

const TEST_CASES_MARKER = '.each([';

await main();

async function main(targetLang) {
  const buffer = await fs.readFile(`__fixtures__/words.csv`);
  const words = await parseCSV(buffer);

  for (const lang of (targetLang ? [targetLang] : LANGS)) {
    const testFilePath = `src/__tests__/direct-matches-${lang}.ts`;
    console.log(`Replenishing test cases in: ${chalk.yellow(testFilePath)}`);
    const testContents = await fs.readFile(testFilePath, 'utf8');

    const testCasesSlice = cutCodeBlock(testContents, TEST_CASES_MARKER, 0);
    const hashStorage = new Set();
    const hashIt = (testCase) => {
      const size = hashStorage.size;
      hashStorage.add(testCase[1].trim().toLowerCase() + '\t' + testCase[3].trim().toLowerCase());
      return hashStorage.size === size;
    }

    const testCases = vm.runInNewContext(testCasesSlice.code);
    testCases.forEach(x => x.unshift(0));
    testCases.forEach(hashIt);

    const skippedTestCases = [];

    const flavorizer = flavorizers[lang];

    for (const word of words) {
      const absoluteMatches = flavorizer
        .compareDebug(word, word.isv, word[lang])
        .filter(m => m.distance.percent <= 20);

      for (const match of absoluteMatches) {
        const testCase = [
          match.distance.absolute,
          match.source.root.value,
          match.target.root.value,
          word.partOfSpeech,
          word.genesis
        ];

        if (!hashIt(testCase)) {
          if (match.distance.absolute === 0) {
            testCases.push(testCase);
          } else {
            skippedTestCases.push(testCase);
          }
        }
      }
    }

    testCases.sort(compareTestCases);
    skippedTestCases.sort(compareTestCases);

    const update1 = testCasesSlice.replace(testCases.map(linearizeTestCase).join(''));
    const skippedTestCasesSlice = cutCodeBlock(update1, TEST_CASES_MARKER, testCasesSlice.start + 1);
    const update2 = skippedTestCasesSlice.replace(skippedTestCases.map(linearizeTestCase).join(''));
    await fs.writeFile(testFilePath, update2);
  }
}

function cutCodeBlock(str, blockStart, startPos) {
  const start = str.indexOf(blockStart, startPos) + blockStart.length - 1;
  const end = findMatchingBracket.default(str, start, true);
  const code = str.slice(start, end + 1);

  return {
    start,
    end,
    code,
    replace(value) {
      const lastNewLine = str.lastIndexOf('\n', end);
      return (str.slice(0, start + 1) + '\n'
        + value
        + str.slice(lastNewLine + 1));
    }
  };
}

function linearizeTestCase(testCase) {
  const arrayContents = testCase.slice(1).map(v => {
    const s = `${v}`;
    if (s.includes("'") || s.includes('\n')) {
      return `"${v}"`;
    } else {
      return `'${v}'`;
    }
  }).join(', ')

  const indent = ' '.repeat(4) + (testCase[0] === 0 ? '' : '// ');
  return indent + `[${arrayContents}],\n`;
}

function compareTestCases(a, b) {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1].localeCompare(b[1], 'sk');
  if (a[2] !== b[2]) return a[2].localeCompare(b[2], 'sk');
  if (a[3] !== b[3]) return a[3].localeCompare(b[3]);
  return a[4].localeCompare(b[4]);
}
