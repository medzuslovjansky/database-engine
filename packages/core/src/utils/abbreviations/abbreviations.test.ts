import { expandAbbr } from './abbreviations';

describe('expandAbbr', () => {
    test('should handle empty input', () => {
        expect(expandAbbr('')).toBe('');
    });

    test('should handle invalid abbreviations', () => {
        expect(expandAbbr('xyz')).toBe('xyz');
    });

    test('should expand basic parts of speech', () => {
        expect(expandAbbr('adj')).toBe('adjective');
        expect(expandAbbr('adv')).toBe('adverb');
        expect(expandAbbr('v')).toBe('verb');
        expect(expandAbbr('n')).toBe('noun, neuter');
    });

    test('should expand noun abbreviations', () => {
        expect(expandAbbr('f')).toBe('noun, feminine');
        expect(expandAbbr('m')).toBe('noun, masculine');
        expect(expandAbbr('f. indecl')).toBe('noun, feminine, indeclinable');
        expect(expandAbbr('m. anim')).toBe('noun, masculine, animate');
        expect(expandAbbr('n. pl')).toBe('noun, neuter, plural');
    });

    test('should expand verb abbreviations', () => {
        expect(expandAbbr('v. tr. ipf')).toBe('verb, transitive, imperfective aspect');
        expect(expandAbbr('v. intr. pf')).toBe('verb, intransitive, perfective aspect');
        expect(expandAbbr('v. aux')).toBe('verb, auxiliary');
    });

    test('should expand pronoun abbreviations', () => {
        expect(expandAbbr('pron. pers')).toBe('pronoun, personal');
        expect(expandAbbr('pron. dem')).toBe('pronoun, demonstrative');
        expect(expandAbbr('pron. refl')).toBe('pronoun, reflexive');
        expect(expandAbbr('pron. rec')).toBe('pronoun, reciprocal');
    });

    test('should expand adjective degrees', () => {
        expect(expandAbbr('adj. comp')).toBe('adjective, comparative degree');
        expect(expandAbbr('adj. sup')).toBe('adjective, superlative degree');
    });

    test('should handle abbreviations with dots and spaces', () => {
        expect(expandAbbr('v.tr.ipf')).toBe('verb, transitive, imperfective aspect');
        expect(expandAbbr('v. tr. ipf.')).toBe('verb, transitive, imperfective aspect');
        expect(expandAbbr('f.indecl.')).toBe('noun, feminine, indeclinable');
    });
});
