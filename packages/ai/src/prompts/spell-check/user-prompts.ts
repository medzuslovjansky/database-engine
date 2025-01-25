import { SpellCheckRequest } from './schema';

export function bg({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Проверете тази дума/фраза: "${translation}"
Допълнителна информация:
- Английски превод: ${english}
- Част на речта: ${partOfSpeech}`;
}

export function ru({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Проверьте это слово/фразу: "${translation}"
Дополнительная информация:
- Английский перевод: ${english}
- Часть речи: ${partOfSpeech}`;
}

export function sl({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Preverite to besedo/frazo: "${translation}"
Dodatne informacije:
- Angleški prevod: ${english}
- Besedna vrsta: ${partOfSpeech}`;
}

export function uk({ partOfSpeech, english, translation }: SpellCheckRequest): string {
  return `Перевірте це слово/фразу: "${translation}"
Додаткова інформація:
- Англійський переклад: ${english}
- Частина мови: ${partOfSpeech}`;
}
