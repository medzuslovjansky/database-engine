import multireplacer from '../../dsl/multireplacer';

export const isv = () =>
  multireplacer
    .named('Fingerprint: Interslavic → Polish')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('Remove non-letters', (r) => r.regexp(/[^\p{Letter}]/u, ['']))
    .rule('Remove digraphs', (r) =>
      r.map({ lj: 'ĺ', ĺj: 'ĺ', nj: 'ń', ńj: 'ń' }),
    )
    //#region Prefixes
    .section('Prefixes')
    .rule('iz- → vy-', (r) => r.regexp(/iz/, ['iz', 'vy']))
    .rule('vȯz- → vy-', (r) => r.regexp(/vȯz/, ['vz', 'vy']))
    .rule('u- → vy-', (r) => r.regexp(/^u/, ['u', 'z']))
    //#endregion
    //#region Suffixes
    .section('Suffixes')
    .rule('-iva- → -ija-', (r) =>
      r.regexp(/(?<!^|\s|-)iva(?!$|\s|-)/, ['iva', 'ija']),
    )
    //#endregion
    .section('Verbs')
    .rule(
      '-ti → -nuti',
      (r) => r.regexp(/ti(?=$|\s)/, ['ti', 'nuti']),
      (p) => p.partOfSpeech('v.'),
    )
    .section('Nouns')
    .rule(
      '-ec → -in',
      (r) => r.regexp(/ec(?=$|\s)/, ['ec', 'in']),
      (p) => p.partOfSpeech('m.'),
    )
    //#region Adjectives
    .section('Adjectives')
    .rule(
      '-ny → -ovy',
      (r) => r.regexp(/ny(?=$|\s)/, ['ny', 'ovy']),
      (p) => p.partOfSpeech('adj.'),
    )
    //#region Roots
    .section('Roots')
    .rule('jdt', (r) => r.regexp(/jdt/, ['jšt']))
    //#region Phonetical grouping
    .section('Phonetical alterations')
    .rule('^h → h/?', (r) => r.regexp(/^h/, ['h', '']))
    .rule('^ž → j', (r) => r.regexp(/^ž/, ['ž', 'j']))
    .rule('ȯ → o/?', (r) => r.regexp(/ȯ/, ['o', '']))
    .section('Phonetical grouping')
    .rule('[cćčtťdďđ]', (r) => r.regexp(/[cćčtťdďđ]+/, ['t']))
    .rule('[sśšzžź]', (r) => r.regexp(/[sśšzžź]+/, ['z']))
    .rule('[aåeěėęijoȯuųvy]', (r) => r.regexp(/[aåeěėęijoȯuųvy]+/, ['o']))
    .rule('[rŕ]', (r) => r.regexp(/[rŕ]/, ['r']))
    .rule('[lĺ]', (r) => r.regexp(/[lĺ]/, ['l']))
    .rule('[nń]', (r) => r.regexp(/[nń]/, ['n']))
    .rule('[gh]', (r) => r.regexp(/[gh]/, ['h']))
    .rule('Reductions', (r) =>
      r.map({
        kt: 't',
        ht: 't',
        lo: 'l',
        ol: 'l',
        or: 'r',
        ro: 'r',
        zkn: 'zn',
        ztn: 'zn',
        tz: 't',
      }),
    )
    .section('Misc')
    // .rule('no start vowel', (r) => r.regexp(/(?<=^|\s|-)o/, ['']))
    // .rule('no end vowel', (r) => r.regexp(/o(?=$|\s|-)/, ['']))
    .rule('no vowel', (r) => r.map({ o: '' }))
    .rule('no double', (r) => r.regexp(/(.)\1+/, ['$1']))
    .build();

export const pl = () =>
  multireplacer
    .named('Fingerprint: Polish → Interslavic')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('Remove non-letters', (r) => r.regexp(/[^\p{Letter}]+/u, ['']))
    .rule('Digraphs', (r) =>
      r.map({
        ch: 'h',
        cz: 'č',
        dł: 'd',
        dz: 'ď',
        rz: 'ŕ',
        sz: 'š',
        ią: 'ą',
        io: 'o',
        iu: 'u',
        ie: 'ě',
        ię: 'ę',
      }),
    )
    .rule('^h → h/?', (r) => r.regexp(/^h/, ['h', '']))
    .rule('[cćčtdď]', (r) => r.regexp(/[cćčtdď]+/, ['t']))
    .rule('[sśšzźż]', (r) => r.regexp(/[sśšzźż]+/, ['z']))
    .rule('[aąeěęijoóuwy]', (r) => r.regexp(/[aąeěęijoóuwy]+/, ['o']))
    .rule('[lł]', (r) => r.regexp(/[lł]/, ['l']))
    .rule('[nń]', (r) => r.regexp(/[nń]/, ['n']))
    .rule('[rŕ]', (r) => r.regexp(/[rŕ]/, ['r']))
    .rule('[gh]', (r) => r.regexp(/[gh]/, ['h']))
    .rule('Reductions', (r) =>
      r.map({
        kt: 't',
        ht: 't',
        lo: 'l',
        ol: 'l',
        or: 'r',
        ro: 'r',
        zkn: 'zn',
        ztn: 'zn',
        tz: 't',
      }),
    )
    // .rule('no start vowel', (r) => r.regexp(/(?<=^|\s|-)o/, ['']))
    // .rule('no end vowel', (r) => r.regexp(/o(?=$|\s|-)/, ['']))
    .rule('no vowel', (r) => r.map({ o: '' }))
    .rule('no double', (r) => r.regexp(/(.)\1+/, ['$1']))

    .build();
