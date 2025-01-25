/**
 * A tuple type representing markers used to highlight spelling errors.
 * @type {[string, string, string]}
 * @property {string} 0 - The left marker that opens the error highlight
 * @property {string} 1 - The right marker that closes the error highlight
 * @property {string} 2 - The separator used between suggestions in verbose mode
 */
export type Markers = [string, string, string];

export interface SpellCheckerContext {
  markers: Markers;
}

export interface SpellCheckedTextPart {
  text: string;
  suggestions?: string[];
}

export class SpellCheckedText {
  #context: SpellCheckerContext;
  #parts: SpellCheckedTextPart[];

  constructor(
    context: SpellCheckerContext,
    parts: SpellCheckedTextPart[],
  ) {
    this.#context = context;
    this.#parts = parts;
  }

  toString(verbose = false): string {
    return this.#parts.map(part => {
      if (!part.suggestions) return part.text;
      const [start, end, separator] = this.#context.markers;
      const content = verbose ? [part.text, ...part.suggestions].join(separator) : part.text;
      return `${start}${content}${end}`;
    }).join('');
  }

  get hasErrors(): boolean {
    return this.#parts.some(part => part.suggestions !== undefined);
  }

  get errors(): Array<{ word: string; suggestions: string[] }> {
    return this.#parts
      .filter(part => part.suggestions !== undefined)
      .map(part => ({ word: part.text, suggestions: part.suggestions! }));
  }

  *[Symbol.iterator](): Iterator<SpellCheckedTextPart> {
    yield* this.#parts;
  }
}
