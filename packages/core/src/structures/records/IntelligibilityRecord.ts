import { IntelligibilityMark } from "@core/primitives";

export interface IntelligibilityRecord {
  id: number;
  lemma: string;
  ratedBy: string;
  sourceLanguage: string;
  targetLanguage: string;
  mark: IntelligibilityMark;
  cognates?: string[];
  helperWords?: string[];
  falseFriends?: string[];
  comment?: string;
}
