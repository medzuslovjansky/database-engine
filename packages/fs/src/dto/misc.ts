export type Language = NonSlavicLanguage | SlavicLanguage;

export type NonSlavicLanguage = 'en' | 'de' | 'nl' | 'eo';

export type SlavicLanguage =
  | 'be' // Belarusian
  | 'bs' // Bosnian
  | 'cnr' // Montenegrin
  | 'cs' // Czech
  | 'csb' // Kashubian
  | 'cu' // Church Slavic
  | 'dsb' // Lower Sorbian
  | 'hr' // Croatian
  | 'hsb' // Upper Sorbian
  | 'mk' // Macedonian
  | 'pl' // Polish
  | 'qpm' // Pomak language
  | 'ru' // Russian
  | 'rue' // Rusyn
  | 'sk' // Slovak
  | 'sl' // Slovenian
  | 'sr' // Serbian
  | 'uk'; // Ukrainian
