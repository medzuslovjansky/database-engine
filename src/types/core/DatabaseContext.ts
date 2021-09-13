import { PartOfSpeech } from '@interslavic/steen-utils/types';
import { WordsDTO } from '../words';

export interface DatabaseContext {
  getWordById(id: string): WordsDTO;
  getPartOfSpeech(id: string): PartOfSpeech;
}
