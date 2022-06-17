import multireplacer from '../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Polish')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('de-Janizator', (r) =>
      r.map({
        ľ: 'ĺ',
      }),
    )
    //#region Prefixes
    .section('Prefixes')
    .rule('Alteration (vòz-)', (r) =>
      r.regexp(/(?<=^|\s|ne|bez)vòz/, ['vz', 'vs', 'vy']),
    )
    .rule('Alteration (iz-)', (r) =>
      r.regexp(/(?<=^|\s|ne|bez)iz/, ['iz', 'vy', 'z']),
    )
    .rule('Alteration (bez-)', (r) => r.regexp(/(?<=^|\s)bez/, ['bez', 'ně']))
    .rule('Unvoicing (-z-)', (r) =>
      r.regexp(/(?<!rå|be)z(?=[hkp])/, ['z', 's']),
    )
    //#endregion
    //#region Suffixes
    .section('Suffixes')
    .rule(
      'Alteration (-ěj-)',
      (r) => r.regexp(/(?!^|\s)ěj(?!$|\s)/, ['ia']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('Alteration (-iva-)', (r) =>
      r.regexp(/(?!^|\s)iva(?!$|\s)/, ['iva', 'ija']),
    )
    .rule('Alteration (-cio-)', (r) => r.regexp(/cio/, ['cio', 'cjo']))
    //#endregion
    //#region Roots
    .section('Roots')
    //#endregion
    //#region Nouns
    .section('Nouns')
    // .rule(
    //   "Alteration (-nik)",
    //   (r) => r.regexp(/ik(?=$|\s)/, ["ik","ar","čar","ičar"]),
    //   (p) => p.partOfSpeech("m.")
    // )
    .rule(
      '-sť',
      (r) => r.regexp(/sť(?=$|\s)/, ['sť', 'śť']),
      (p) => p.partOfSpeech('f.'),
    )
    // .rule(
    //   "Alteration (-nja)",
    //   (r) => r.regexp(/nja(?=$|\s)/, ["nja","nica"]),
    //   (p) => p.partOfSpeech("f.")
    // )
    //#endregion
    //#region Adjectives
    .section('Adjectives')
    .rule(
      'Alterate ending (-ny)',
      (r) => r.regexp(/ny(?=$|\s)/, ['ny', 'ovy']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Alterate ending -[gk]i-',
      (r) => r.regexp(/(?<=g|k)y(?=$|\s)/, ['y', 'i']),
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
    //#endregion
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
    .rule('Syllabic L', (r) => r.regexp(/ŀ/, ['l', 'lu', 'il', 'el']))
    .rule('ıj', (r) => r.regexp(/ıji?/, ['i']))
    .rule('-ť → -ć', (r) => r.regexp(/ť(?=$|\s)/, ['ť', 'ć']))
    .rule('-ť-', (r) => r.regexp(/ť(?!$|\s)/, ['ť', 'ć', 'dź']))
    .rule('-ć-', (r) => r.regexp(/ć/, ['ć', 'c']))
    .rule('Soft R-RZ', (r) => r.regexp(/r(?=[iěė])/, ['r', 'rz']))
    .rule('T-C', (r) => r.regexp(/t/, ['t', 'c']))
    .rule('Foreign H', (r) => r.regexp(/h/, ['h', 'ğ']))
    .rule('Foreign G', (r) => r.regexp(/g/, ['g', 'ğ']))
    .rule('DŽ', (r) => r.regexp(/dž/, ['dž', 'dz']))
    .rule('Yat', (r) => r.regexp(/[ěė]/, ['e', 'a', 'ie', 'io']))
    .rule('Å', (r) => r.regexp(/å/, ['å', 'a']))
    .rule('Syllabic R', (r) => r.regexp(/ṙ/, ['r', 'ar']))
    .rule('ŕ', (r) => r.regexp(/ŕ/, ['r', 'rz']))
    .rule('Alteration (i-y)', (r) => r.regexp(/i/, ['i', 'y']))
    .rule('Ų', (r) => r.regexp(/ų/, ['ą', 'ę']))
    .rule('l→ł', (r) => r.regexp(/l/, ['l', 'ł']))
    .rule('Etymological → Polish', (r) =>
      r.map({
        ę: 'ę',
        å: 'o',
        ğ: 'h',
        ė: 'e',
        ȯ: 'e',
        đ: 'dz',
        ĺ: 'l',
        ď: 'dź',
        ḓ: 'd',
        ś: 'ś',
        ù: 'u',
        ť: 't',
        ź: 'ź',
        '’': '',
      }),
    )
    .rule('RZY', (r) => r.regexp(/rzi/, ['rzy']))
    //#endregion
    //#region Alphabet
    .section('Alphabet')
    .rule('Polish', (r) =>
      r.map({
        h: 'ch',
        ž: 'ż',
        š: 'sz',
        č: 'cz',
        v: 'w',
      }),
    )
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
