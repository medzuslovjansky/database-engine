import 'zx/globals';
import parseCSV from './utils/parseCSV.mjs';
import { LANGS, LANGUAGE_NAMES } from "./utils/constants.mjs";
import generation from "../dist/generation/index.js";

for (const lang of LANGS) {
  const buffer = await fs.readFile(`__fixtures__/rules/${lang}.csv`);
  const rules = await parseCSV(buffer);
  const code = generation.code(`${LANGUAGE_NAMES.isv} → ${LANGUAGE_NAMES[lang]}`, rules);
  await fs.mkdirp('src/flavorizers');
  await fs.writeFile(`src/flavorizers/${lang}.ts`, code);
}

await $`eslint --fix src/flavorizers/**/*.ts`;
