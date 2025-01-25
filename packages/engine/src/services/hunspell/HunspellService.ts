import { Nodehun } from 'nodehun';
import { dictionaryMap } from './dictionaries';
import { Markers, SpellCheckedText } from './SpellCheckedText';

export interface HunspellOptions {
  markers?: Markers;
  language?: string;
}

interface TextPart {
  text: string;
  suggestions?: string[];
}

const DEFAULT_MARKERS: Markers = ['{', '}', '|'];

export class HunspellService {
  public readonly hunspell: Nodehun;
  public readonly markers: Markers;
  public readonly language?: string;

  private constructor(affBuffer: Buffer, dicBuffer: Buffer, options?: HunspellOptions) {
    this.hunspell = new Nodehun(affBuffer, dicBuffer);
    this.language = options?.language;
    this.markers = options?.markers || DEFAULT_MARKERS;
  }

  static async for(language: string, options?: Omit<HunspellOptions, 'language'>): Promise<HunspellService> {
    try {
      const initializer = dictionaryMap[language];
      if (!initializer) {
        throw new Error(`No Hunspell dictionary found for language ${language}`);
      }

      const { aff, dic } = await initializer();
      return new HunspellService(aff, dic, { ...options, language });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load dictionary for language ${language}: ${message}`);
    }
  }

   public async check(text: string): Promise<SpellCheckedText> {
    const parts: TextPart[] = [];
    let currentPos = 0;
    const wordRegex = /[\p{Letter}\p{Mark}]+/gu;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      // Add text before the word
      if (match.index > currentPos) {
        parts.push({ text: text.slice(currentPos, match.index) });
      }

      // Add the word with spell check
      const word = match[0];
      const { suggestions } = await this._checkWord(word);
      parts.push({ text: word, suggestions });

      currentPos = match.index + word.length;
    }

    // Add remaining text after last word
    if (currentPos < text.length) {
      parts.push({ text: text.slice(currentPos) });
    }

    return new SpellCheckedText(this, parts);
  }

  private async _checkWord(text: string): Promise<TextPart> {
    const correct = await this.hunspell.spell(text);
    const suggestions = correct ? undefined : (await this.hunspell.suggest(text) || []);
    return { text, suggestions };
  }
}
