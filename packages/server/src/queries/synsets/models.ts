/**
 * Synset-related data models
 */

/**
 * Interface representing a synset with its lemmas
 */
export interface Synset {
  /** Synset identifier */
  id: string;
  /** Source type of the synset */
  source_type?: string;
  /** Source identifier in the original system */
  source_id?: string;
  /** Domain identifier */
  domain_id?: number;
  /** Definition of the synset */
  definition?: string;
  /** Associated lemmas with their details */
  lemmas?: Lemma[];
}

/**
 * Interface representing a lemma
 */
export interface Lemma {
  /** Lemma identifier */
  id: string;
  /** The text value of the lemma */
  value: string;
  /** Language code */
  language_code: string;
  /** Part of speech */
  pos: string;
  /** Source type */
  source_type?: string;
  /** Source identifier */
  source_id?: string;
  /** Additional metadata */
  metadata?: string;
  /** Sense number (ordering of senses) */
  sense_number?: number;
  /** Annotation of the meaning */
  annotation?: string;
}

/**
 * Interface for language-specific LIKE queries
 */
export interface LanguageQuery {
  [languageCode: string]: string;
}
