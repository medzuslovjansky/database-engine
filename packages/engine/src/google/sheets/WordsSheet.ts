import type { Sheet } from '@interslavic/database-engine-google';

import type { WordsAddLangRecord, WordsRecord } from '../dto';

export type WordsSheet = Sheet<WordsRecord>;
export type WordsAddLangSheet = Sheet<WordsAddLangRecord>;
export type SuggestionsSheet = Sheet<WordsAddLangRecord>;
