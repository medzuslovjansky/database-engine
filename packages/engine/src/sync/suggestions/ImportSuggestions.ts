import type { MultilingualSynsetRepository } from '@interslavic/database-engine-fs';

import type { SuggestionsDTO, SuggestionsSheet } from '../../google';
import { toMultiSynset } from '../../google';
import { log } from '../../utils';

export type ImportSuggestionsOptions = {
  readonly multisynsets: MultilingualSynsetRepository;
  readonly selectedIds: string[];
  readonly suggestions: SuggestionsSheet;
};

export class ImportSuggestions {
  protected readonly multisynsets: MultilingualSynsetRepository;
  protected readonly selectedIds: Set<string>;
  protected readonly suggestionsSheet: SuggestionsSheet;

  constructor(options: Readonly<ImportSuggestionsOptions>) {
    this.multisynsets = options.multisynsets;
    this.selectedIds = new Set(options.selectedIds);
    this.suggestionsSheet = options.suggestions;
  }

  public async execute(): Promise<void> {
    const synsetIds = await this.multisynsets.keys();
    // eslint-disable-next-line unicorn/no-array-reduce
    const maxSynsetId = synsetIds.reduce(getMax, 0);
    const suggestions = await this._getSuggestions();
    let id = maxSynsetId;
    for (const suggestion of suggestions) {
      if (!this.selectedIds.has(suggestion.id)) {
        continue;
      }

      id++;
      const multisynset = toMultiSynset({
        id,
        isv: suggestion.isv,
        addition: suggestion.addition,
        partOfSpeech: suggestion.partOfSpeech,
        type: suggestion.type,
        en: suggestion.en,
        sameInLanguages: '',
        genesis: '',
        ru: suggestion.ru,
        be: suggestion.be,
        uk: suggestion.uk,
        pl: suggestion.pl,
        cs: suggestion.cs,
        sk: suggestion.sk,
        bg: suggestion.bg,
        mk: suggestion.mk,
        sr: suggestion.sr,
        hr: suggestion.hr,
        sl: suggestion.sl,
        cu: '',
        de: '',
        nl: '',
        eo: '',
        frequency: '',
        intelligibility: '',
        using_example: '',
      });

      await this.multisynsets.insert(multisynset);
    }

    if (id === maxSynsetId) {
      console.log('No suggestions found with selected ids:', [
        ...this.selectedIds,
      ]);
    }
  }

  private async _getSuggestions(): Promise<SuggestionsDTO[]> {
    const sheet = this.suggestionsSheet;
    return log.trace.complete(
      { cat: ['gsheets'], tid: ['fetch', sheet.id] },
      `fetch ${sheet.title}`,
      async () => {
        const dtos = (await sheet.getValues()) as unknown as SuggestionsDTO[];
        return dtos;
      },
    );
  }
}

function getMax(max: number, value: number): number {
  return Math.max(max, value);
}
