import type { Sheet } from '@interslavic/database-engine-google';

import type { WordsAddLangDTO, WordsDTO } from '../dto';

export type WordsSheet = Sheet<WordsDTO>;
export type WordsAddLangSheet = Sheet<WordsAddLangDTO>;
