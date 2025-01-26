import { utils } from '@interslavic/database-engine-core';
import { SpellCheckRequest } from './schema';

export function bg({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Проверете тази дума/фраза: "${translation}"
Допълнителна информация:
- Английски превод: ${english}
- Част на речта: ${utils.expandAbbr(partOfSpeech, 'bg')}`;
}

export function ru({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Проверьте это слово/фразу: "${translation}"
Дополнительная информация:
- Английский перевод: ${english}
- Часть речи: ${utils.expandAbbr(partOfSpeech, 'ru')}`;
}

export function sl({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Preverite to besedo/frazo: "${translation}"
Dodatne informacije:
- Angleški prevod: ${english}
- Besedna vrsta: ${utils.expandAbbr(partOfSpeech, 'sl')}`;
}

export function uk({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Перевірте це слово/фразу: "${translation}"
Додаткова інформація:
- Англійський переклад: ${english}
- Частина мови: ${utils.expandAbbr(partOfSpeech, 'uk')}`;
}
