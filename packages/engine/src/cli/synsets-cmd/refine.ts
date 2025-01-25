import compose from '../../compositionRoot';
import { OpenAIService } from '../../services/openai';
import { HunspellService } from '../../services/hunspell';
import type { RefineArgv } from './argv';
import { parseSelectedSynsets } from './common';
import type { MultilingualSynset, Language } from '@interslavic/database-engine-core';
import { Lemma, Synset } from '@interslavic/database-engine-core';
import { distance } from 'fastest-levenshtein';

const SLAVIC_LANGS = ['be', 'bg', 'cs', 'hr', 'mk', 'pl', 'ru', 'sk', 'sl', 'sr', 'uk'] as const;
type SlavicLanguage = typeof SLAVIC_LANGS[number];

// Maximum allowed Levenshtein distance for AI suggestions
const MAX_LEVENSHTEIN_DISTANCE = 3;

function isSlavicLanguage(lang: string): lang is SlavicLanguage {
  return SLAVIC_LANGS.includes(lang as SlavicLanguage);
}

function createSynset(lemmas: string[], verified: boolean = false): Synset {
  return new Synset({
    verified,
    lemmas: lemmas.map(value => new Lemma({ value }))
  });
}

export async function refine(argv: RefineArgv) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const { fileDatabase } = await compose({ offline: true });
  const openai = new OpenAIService(process.env.OPENAI_API_KEY);

  // Use provided languages or default to all Slavic languages
  const targetLangs = argv.lang?.filter(isSlavicLanguage) || SLAVIC_LANGS;

  // Initialize spell checkers if in spelling mode
  const spellCheckers = new Map<string, HunspellService>();
  if (argv.mode === 'spelling') {
    for (const lang of targetLangs) {
      try {
        spellCheckers.set(lang, new HunspellService(lang));
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.warn(`Could not initialize spell checker for ${lang}: ${error.message}`);
        }
      }
    }
  }

  // Get selected synsets or process all
  const selectedIds = await parseSelectedSynsets(fileDatabase.multisynsets, argv);
  if (argv.only && !selectedIds) {
    console.log('Skipping refine because --only is used and no synsets are selected');
    return;
  }

  // Process each synset
  await fileDatabase.multisynsets.forEach(async (synset: MultilingualSynset) => {
    if (selectedIds && !selectedIds.includes(synset.id)) {
      return;
    }

    let modified = false;
    const updatedSynset = { ...synset };

    for (const lang of targetLangs) {
      const translation = synset.synsets[lang as Language];
      if (!translation) continue;

      if (argv.mode === 'spelling') {
        // Only check verified translations for spelling
        if (!translation.verified) continue;

        const spellChecker = spellCheckers.get(lang);
        if (!spellChecker) continue;

        const correctedLemmas: string[] = [];
        let hasCorrections = false;

        for (const lemma of translation.lemmas) {
          const lemmaText = lemma.toString();
          const { markedText, hasInvalidWords, invalidWords } = await spellChecker.markInvalidWords(lemmaText);

          if (hasInvalidWords) {
            const response = await openai.checkSpelling({
              word: lemmaText,
              markedWord: markedText,
              language: lang,
              context: {
                english: synset.synsets.en?.lemmas.map(l => l.toString()).join(', '),
                partOfSpeech: synset.synsets.isv?.lemmas[0]?.steen?.partOfSpeech,
                invalidWords: invalidWords.map(w => ({
                  word: w.word,
                  suggestions: w.suggestions
                }))
              }
            });

            if (response.corrections) {
              // Validate the suggestion using Levenshtein distance
              const dist = distance(lemmaText, response.corrections);
              const isReasonableChange = dist <= MAX_LEVENSHTEIN_DISTANCE;

              if (!argv.dryRun && isReasonableChange) {
                correctedLemmas.push(response.corrections);
                hasCorrections = true;
                console.log(`[${lang}] Corrected "${lemmaText}" (${markedText}) to "${response.corrections}" in synset ${synset.id}`);
              } else if (!isReasonableChange) {
                console.log(`[${lang}] Rejected correction "${response.corrections}" for "${lemmaText}" - too different (distance: ${dist})`);
                correctedLemmas.push(lemmaText);
              } else {
                console.log(`[${lang}] Would correct "${lemmaText}" (${markedText}) to "${response.corrections}" in synset ${synset.id}`);
                correctedLemmas.push(lemmaText);
              }
            } else {
              // AI confirmed the word is correct despite spell checker
              correctedLemmas.push(lemmaText);
              if (!argv.dryRun) {
                console.log(`[${lang}] Confirmed "${lemmaText}" is correct despite spell checker warnings in synset ${synset.id}`);
              }
            }
          } else {
            correctedLemmas.push(lemmaText);
          }
        }

        if (hasCorrections && !argv.dryRun) {
          updatedSynset.synsets[lang as Language] = createSynset(correctedLemmas, true);
          modified = true;
        }
      } else if (argv.mode === 'translations') {
        // Only process unverified translations
        if (translation.verified) continue;

        const response = await openai.refineTranslation({
          synset,
          language: lang
        });

        if (response.refinements && !argv.dryRun) {
          updatedSynset.synsets[lang as Language] = createSynset(response.refinements, response.verified);
          modified = true;
          console.log(`[${lang}] Refined translation in synset ${synset.id}`);
        } else {
          console.log(`[${lang}] Would refine translation in synset ${synset.id}`);
        }
      }
    }

    if (modified) {
      await fileDatabase.multisynsets.update(synset.id, updatedSynset);
    }
  });
}
