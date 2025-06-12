import { IntelligibilityMark } from '@core/primitives';

const MARK_TO_VALUE: Record<IntelligibilityMark, number> = {
  '.': 1,
  'n': 0,
  't': 0.25,
  'f': 0.25,
  'r': 0.3,
  'a': 0.3,
  'z': 0.3,
  'k': 0.7,
  'm': 0.7,
  '?': 0.5,
};

export class IntelligibilityVectorV1 {
  private _intelligibility: Map<string, IntelligibilityMark>;

  private constructor(map?: Map<string, IntelligibilityMark>) {
    this._intelligibility = map ? new Map(map) : new Map();
  }

  public update(language: string, mark?: IntelligibilityMark): void {
    if (!mark) {
      this._intelligibility.delete(language);
      return;
    }
    this._intelligibility.set(language, mark);
  }

  public getMark(language: string): IntelligibilityMark | undefined {
    return this._intelligibility.get(language);
  }

  public getValue(language: string): number | undefined {
    const mark = this._intelligibility.get(language);
    return mark ? MARK_TO_VALUE[mark] : undefined;
  }

  public equals(other: IntelligibilityVectorV1 | undefined): boolean {
    if (!other) return false;
    if (this._intelligibility.size !== other._intelligibility.size) return false;
    for (const [lang, mark] of this._intelligibility.entries()) {
      if (other._intelligibility.get(lang) !== mark) return false;
    }
    return true;
  }

  public isEmpty(): boolean {
    return this._intelligibility.size === 0;
  }

  public toString(): string {
    if (this._intelligibility.size === 0) {
      return '';
    }
    const parts: string[] = [];
    for (const [lang, mark] of [...this._intelligibility.entries()].sort()) {
      let symbol: string;
      switch (mark) {
        case '.': symbol = '+'; break;
        case 'n': symbol = '-'; break;
        case 't': case 'f': case 'r': case 'a': case 'z': case 'k': case 'm': case '?': default: symbol = '~'; break;
      }
      parts.push(`${lang}${symbol}`);
    }
    return parts.join(' ');
  }

  public clone(): IntelligibilityVectorV1 {
    return new IntelligibilityVectorV1(this._intelligibility);
  }

  public static empty(): IntelligibilityVectorV1 {
    return new IntelligibilityVectorV1();
  }

  public static fromString(str: string): IntelligibilityVectorV1 {
    const vector = new IntelligibilityVectorV1();
    // Parse format like "ru+ bg- pl~"
    const parts = str.trim().split(/\s+/);
    for (const part of parts) {
      if (!part) continue;
      const match = part.match(/^([a-z]{2,4})([\+\-\~])$/);
      if (match) {
        const [, lang, symbol] = match;
        let mark: IntelligibilityMark;
        switch (symbol) {
          case '+': mark = '.'; break;
          case '-': mark = 'n'; break;
          case '~': default: mark = '?'; break;
        }
        vector._intelligibility.set(lang, mark);
      }
    }
    return vector;
  }

  public toJSON(): string {
    return this.toString();
  }
}
