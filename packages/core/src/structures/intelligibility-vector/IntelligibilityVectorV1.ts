import { IntelligibilityMark } from '@core/primitives';

type IntelligibilityValue = {
  value: number;
  mark?: IntelligibilityMark;
};

export class IntelligibilityVectorV1 {
  private _intelligibility: Map<string, IntelligibilityValue>;

  private constructor(map?: Map<string, IntelligibilityValue>) {
    this._intelligibility = new Map(map);
  }

  public update(language: string, mark?: IntelligibilityMark): void {
    if (!mark) {
      this._intelligibility.delete(language);
      return;
    }

    // Convert mark to a value between 0 and 1
    let value: number;

    switch (mark) {
      case '.': // Fully intelligible
        value = 1;
        break;
      case 'n': // Not intelligible
        value = 0;
        break;
      case 't': // Difficult
      case 'f': // False friend
        value = 0.25;
        break;
      case 'r': // Rare
      case 'a': // Archaic
      case 'z': // Obsolete
        value = 0.3;
        break;
      case 'k': // Contextual
      case 'm': // Intuitive
        value = 0.7;
        break;
      case '?': // Unmarked
      default:
        value = 0.5;
        break;
    }

    this._intelligibility.set(language, {
      value,
      mark,
    });
  }

  public getValue(language: string): number | undefined {
    return this._intelligibility.get(language)?.value;
  }

  public equals(other: IntelligibilityVectorV1 | undefined): boolean {
    if (!other) return false;
    if (this._intelligibility.size !== other._intelligibility.size) return false;
    for (const [lang, data] of this._intelligibility.entries()) {
      if (!IntelligibilityVectorV1._areValuesEqual(data, other._intelligibility.get(lang))) return false;
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

    for (const [lang, data] of [...this._intelligibility.entries()].sort()) {
      let symbol: string;

      if (data.value === 1) {
        symbol = '+';
      } else if (data.value === 0) {
        symbol = '-';
      } else {
        symbol = '~';
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
        const value = symbol === '+' ? 1 : symbol === '-' ? 0 : 0.5;
        vector._intelligibility.set(lang, { value });
      }
    }

    return vector;
  }

  public toJSON(): string {
    return this.toString();
  }

  private static _areValuesEqual(a: IntelligibilityValue | undefined, b: IntelligibilityValue | undefined): boolean {
    if (!a || !b) return a === b;
    return a.value === b.value && a.mark === b.mark;
  }
}
