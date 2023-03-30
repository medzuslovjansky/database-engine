import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Polish')
    .rule('Ignore case', (r) => r.lowerCase())

    //#region Prefixes
    .section('Prefixes')
    .rule('Alteration (vȯz-)', (r) =>
      r.regexp(/(?<=^|\s|ne|bez)vȯz/, ['vz', 'vy']),
    )
    .rule('Alteration (iz-)', (r) =>
      r.regexp(/(?<=^|\s|ne|bez)iz/, ['iz', 'vy', 'z']),
    )
    .rule('Alteration (bez-)', (r) => r.regexp(/(?<=^|\s)bez/, ['bez', 'ne']))
    .rule('Alteration (ne-)', (r) => r.regexp(/ne/, ['ne', 'ně']))
    //#endregion
    //#region Suffixes
    .section('Suffixes')
    .rule('Alteration (-ěj-)', (r) => r.regexp(/ěj/, ['ěj', 'ia']))
    .rule('Alteration (-iva-)', (r) =>
      r.regexp(/(?!^|\s)iva(?!$|\s)/, ['iva', 'ija']),
    )
    //#endregion
    //#region Roots
    .section('Roots')
    //#endregion
    //#region Nouns
    .section('Nouns')
    .rule(
      'Feminization',
      (r) => r.regexp(/([^aåeěėęijoȯuųy])(?=$|\s)/, ['$1', '$1a']),
      (p) => p.partOfSpeech('m.'),
    )
    //#endregion
    //#region Adjectives
    .section('Adjectives')
    .rule(
      'Alterate ending (-ny)',
      (r) => r.regexp(/ny(?=$|\s)/, ['ny', 'ovy']),
      (p) => p.partOfSpeech('adj.'),
    )
    //#endregion
    //#region Adverbs
    .section('Adverbs')
    .rule(
      'Zero ending',
      (r) => r.regexp(/a(?=$|\s)/, ['a', '']),
      (p) => p.partOfSpeech('adv.'),
    )
    .rule(
      '-o → -ie',
      (r) => r.regexp(/o(?=$|\s)/, ['o', 'ie']),
      (p) => p.partOfSpeech('adv.'),
    )
    //#region Verbs
    .section('Verbs')
    .rule(
      'Alteration (-kti)',
      (r) => r.regexp(/[kg]ti(?=$|\s)/, ['ć']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Alteration (-ti)',
      (r) => r.regexp(/ti(?=$|\s)/, ['ť']),
      (p) => p.partOfSpeech('v.'),
    )
    //#endregion
    //#region Phonetical changes
    .section('Phonetical changes')
    .rule('Syllabic L', (r) => r.regexp(/ȯl/, ['lu', 'il', 'el', 'o']))
    .rule('Syllabic R', (r) =>
      r.regexp(/(?<=[bdghkmpstv])r(?=[bčdḓđfgkmnsštťvz])/, ['r', 'ar']),
    )
    .rule('Unvoicing (-z-)', (r) => r.regexp(/z/, ['z', 's']))
    .rule('j→i', (r) => r.regexp(/ji/, ['i']))
    .rule('i←→j', (r) => r.regexp(/[ij]/, ['i', 'j']))
    .rule('Alteration (i-y)', (r) => r.regexp(/i/, ['i', 'y']))
    .rule('-ť → -ć', (r) => r.regexp(/[tť]/, ['t', 'ć', 'ď']))
    .rule('-ć-', (r) => r.regexp(/ć/, ['č', 'ć', 'c']))
    .rule('r←→ŕ', (r) => r.regexp(/[rŕ]/, ['r', 'ŕ']))
    .rule('oóe', (r) => r.regexp(/[oȯ]/, ['o', 'ó', 'e']))
    .rule('Foreign H', (r) => r.regexp(/h/, ['h', 'ğ']))
    .rule('Foreign G', (r) => r.regexp(/g/, ['g', 'ğ']))
    .rule('đ', (r) => r.regexp(/(đ|dž)/, ['dž', 'ď']))
    .rule('ď → dz,dź', (r) => r.regexp(/ď/, ['dz', 'dź']))
    .rule('Yat', (r) => r.regexp(/ě/, ['e', 'a', 'ie', 'io']))
    .rule('Å', (r) => r.regexp(/å/, ['o', 'a']))
    .rule('Ų', (r) => r.regexp(/ų/, ['ą', 'ę']))
    .rule('lĺł', (r) => r.regexp(/[lĺ]/, ['l', 'ł']))
    .rule('v→v/u', (r) => r.regexp(/v/, ['v', 'u']))
    //#endregion
    //#region Alphabet
    .section('Alphabet')
    .rule('Polish', (r) =>
      r.map({
        č: 'cz',
        h: 'ch',
        v: 'w',
        ğ: 'h',
        ŕ: 'rz',
        š: 'sz',
        ž: 'ż',
      }),
    )
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
