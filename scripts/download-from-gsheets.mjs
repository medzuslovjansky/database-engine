import 'zx/globals';
import { GIDs, LANGS } from "./utils/constants.mjs";

const BASE_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTB2DAu_uRJoHlPx5x_5O7YlsUrbZ89fsHWT7d8bRinQnAWMaYc3rQTwJ_Tt8mLQBXu4pBaKXFIrPdn/pub?output=csv`;

async function downloadSheet(lang) {
  const outFile = `__fixtures__/rules/${lang}.csv`;
  const url = `${BASE_URL}&gid=${GIDs[lang]}`;

  await $`curl -L -o ${outFile} ${url}`
}

await fs.mkdirp('__fixtures__/rules');
for (const lang of LANGS) {
  await downloadSheet(lang);
}