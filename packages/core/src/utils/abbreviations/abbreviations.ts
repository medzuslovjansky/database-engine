import { Language } from '../../constants';
import i18n from './i18n';

type AbbrPart = {
    type: string;
    details?: string[];
};

const ABBR_PATTERNS: Record<string, AbbrPart> = {
    'adj': { type: 'adjective' },
    'adv': { type: 'adverb' },
    'conj': { type: 'conjunction' },
    'f': { type: 'noun', details: ['feminine'] },
    'm': { type: 'noun', details: ['masculine'] },
    'n': { type: 'noun', details: ['neuter'] },
    'num': { type: 'numeral' },
    'pron': { type: 'pronoun' },
    'v': { type: 'verb' },
    'prep': { type: 'preposition' },
    'intj': { type: 'interjection' },
    'particle': { type: 'particle' },
    'prefix': { type: 'prefix' },
    'suffix': { type: 'suffix' },
    'phrase': { type: 'phrase' },

    // Modifiers
    'anim': { type: 'modifier', details: ['animate'] },
    'indecl': { type: 'modifier', details: ['indeclinable'] },
    'pl': { type: 'modifier', details: ['plural'] },
    'sg': { type: 'modifier', details: ['singular'] },
    'comp': { type: 'modifier', details: ['comparative'] },
    'sup': { type: 'modifier', details: ['superlative'] },
    'refl': { type: 'modifier', details: ['reflexive'] },
    'rec': { type: 'modifier', details: ['reciprocal'] },
    'rel': { type: 'modifier', details: ['relative'] },
    'dem': { type: 'modifier', details: ['demonstrative'] },
    'indef': { type: 'modifier', details: ['indefinite'] },
    'int': { type: 'modifier', details: ['interrogative'] },
    'pers': { type: 'modifier', details: ['personal'] },
    'poss': { type: 'modifier', details: ['possessive'] },
    'ipf': { type: 'modifier', details: ['imperfective'] },
    'pf': { type: 'modifier', details: ['perfective'] },
    'tr': { type: 'modifier', details: ['transitive'] },
    'intr': { type: 'modifier', details: ['intransitive'] },
    'aux': { type: 'modifier', details: ['auxiliary'] },
};

/**
 * Expands grammatical abbreviations into full descriptions
 * @param abbr - Abbreviation string (e.g. "f. indecl.", "v. tr. ipf.")
 * @param lang - Language code for translations (default: 'en')
 * @returns Expanded description of the abbreviation
 */
export function expandAbbr(abbr: string, lang: Language = 'en'): string {
    if (!abbr) return '';

    const parts = abbr.toLowerCase()
        .split(/[.,\s/]+/)
        .filter(Boolean);

    const mainPart = parts[0];
    const mainType = ABBR_PATTERNS[mainPart];

    if (!mainType) return abbr;

    const translations = i18n[lang] || i18n['en'];
    const description: string[] = [translations[mainType.type]];

    if (mainType.details) {
        description.push(...mainType.details.map(d => translations[d]));
    }

    // Process modifiers
    for (let i = 1; i < parts.length; i++) {
        const modifier = ABBR_PATTERNS[parts[i]];
        if (modifier?.details) {
            description.push(...modifier.details.map(d => translations[d]));
        }
    }

    return description.filter(Boolean).join(', ');
}
