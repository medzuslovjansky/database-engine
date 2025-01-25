import { promisify } from 'util';

export type DictionaryInitializer = () => Promise<DictionaryResult>;
export type DictionaryResult = {
  aff: Buffer;
  dic: Buffer;
};

const createCallbackDictionaryInitializer = (packageName: string): DictionaryInitializer => {
  return async () => {
    const dictionary = await import(packageName);
    const getDictionary = promisify(dictionary.default);
    return getDictionary();
  };
};

const createImportBasedDictionaryInitializer = (packageName: string): DictionaryInitializer => {
  return async () => {
    const dictionary = await import(packageName);
    return dictionary.default;
  };
};

const createStringBasedDictionaryInitializer = ({ aff, dic }: { aff: string; dic: string }): DictionaryInitializer => {
  return async () => {
    return {
      aff: Buffer.from(aff + '\n'),
      dic: Buffer.from(dic + '\n'),
    };
  };
};

/**
 * Map of language codes to their dictionary initializers
 */
export const dictionaryMap: Record<string, DictionaryInitializer> = {
  test: createStringBasedDictionaryInitializer({
    dic: `\
6
a
for
in
jump/A
run/A
walk/A`,
    aff: `\
SET UTF-8
SFX A Y 1
SFX A 0 ed .`,
  }),
  be: createCallbackDictionaryInitializer('dictionary-be'),
  bg: createImportBasedDictionaryInitializer('dictionary-bg'),
  cs: createImportBasedDictionaryInitializer('dictionary-cs'),
  hr: createImportBasedDictionaryInitializer('dictionary-hr'),
  mk: createImportBasedDictionaryInitializer('dictionary-mk'),
  pl: createImportBasedDictionaryInitializer('dictionary-pl'),
  ru: createImportBasedDictionaryInitializer('dictionary-ru'),
  sk: createImportBasedDictionaryInitializer('dictionary-sk'),
  sl: createImportBasedDictionaryInitializer('dictionary-sl'),
  sr: createImportBasedDictionaryInitializer('dictionary-sr'),
  uk: createImportBasedDictionaryInitializer('dictionary-uk'),
};
