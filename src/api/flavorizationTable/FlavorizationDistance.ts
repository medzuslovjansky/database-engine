export type FlavorizationDistance = {
  /**
   * Levenshtein distance, character count
   * The diacritic-only differences count as 0.5.
   */
  absolute: number;
  /**
   * Levenshtein distance, relatively calculated by the formula:
   * = C / 0.5 * (L1 + L2), where:
   * C is the absolute distance,
   * L1, L2 are the respective lengths of the compared words
   */
  percent: number;
};
