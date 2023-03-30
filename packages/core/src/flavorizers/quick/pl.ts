import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Polish')
    .rule('Ignore case', (r) => r.lowerCase())

    //#region Prefixes
    .section('Prefixes')
    .rule(
      'Alteration (vȯz-)',
      (r) => r.regexp(/(?<=^|\s|ne|bez)vȯz/, ['vz']),
      (p) => p.genesis('?S'),
    )
    .rule(
      'Alteration (pro-)',
      (r) => r.regexp(/(?<=^|\s|ne|bez)pro/, ['pro', 'prě']),
      (p) => p.genesis('?S'),
    )
    .rule(
      'Alteration (pri-)',
      (r) => r.regexp(/(?<=^|\s|ne|bez)pri/, ['pŕi']),
      (p) => p.genesis('?S'),
    )
    .rule(
      'Alteration (iz-)',
      (r) => r.regexp(/(?<=^|\s|ne|bez)izȯ?/, ['vy']),
      (p) => p.genesis('?S'),
    )
    .rule(
      'Alteration (ne-)',
      (r) => r.regexp(/ne/, ['ne', 'ně']),
      (p) => p.genesis('?S'),
    )
    //#endregion
    //#region Adjectives
    .section('Adjectives')
    .rule(
      '-sky',
      (r) => r.regexp(/sky(?=$|\s)/, ['ski']),
      (p) => p.partOfSpeech('adj.'),
    )
    //#endregion
    //#region Nouns
    .rule(
      '-ika',
      (r) => r.regexp(/ika(?=$|\s)/, ['yka']),
      (p) => p.partOfSpeech('f.'),
    )
    //#endregion
    //#region Adverbs
    .rule(
      '-o → -ie',
      (r) => r.regexp(/o(?=$|\s)/, ['ie', 'o']),
      (p) => p.partOfSpeech('adv., suffix'),
    )
    //#endregion
    //#region Verbs
    .section('Verbs')
    .rule(
      'Alteration (-kti)',
      (r) => r.regexp(/[kg]ti(?=$|\s)/, ['c']),
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
    .rule('ĺ', (r) => r.regexp(/lj/, ['ĺ']))
    .rule('ń', (r) => r.regexp(/nj/, ['ń']))
    .rule('-žȯl-', (r) => r.regexp(/žȯl/, ['žól']))
    .rule('Syllabic L', (r) => r.regexp(/ȯl/, ['lu', 'el']))
    .rule('Syllabic R', (r) =>
      r.regexp(/(?<=[bdghkmpstv])r(?=[bčdḓđfgkmnsštťvz])/, ['r', 'ar']),
    )
    .rule('ńsk', (r) => r.regexp(/nsk(?=.?$|.?\s)/, ['ńsk']))
    .rule('ij? → i', (r) => r.regexp(/ij(?=.$|.\s)/, ['i']))
    .rule('ji → i', (r) => r.regexp(/ji/, ['i']))
    .rule('ťj → ti', (r) => r.regexp(/ťj/, ['ťi']))
    //#region Softening
    .rule('dě → ďe', (r) => r.regexp(/d(?=ě)/, ['ď']))
    .rule('rě → ŕe', (r) => r.regexp(/rě/, ['ŕe']))
    .rule('tě → cě', (r) => r.regexp(/t(?=ě)/, ['c']))
    .rule('ti → ci', (r) => r.regexp(/t(?=i)/, ['c', 't']))
    .rule('ȯ', (r) => r.regexp(/ȯ/, ['e']))
    .rule(
      'Foreign H',
      (r) => r.regexp(/h/, ['h', 'ğ']),
      (p) => p.genesis('?I'),
    )
    .rule('đ', (r) => r.regexp(/đ/, ['ď', 'dž']))
    .rule('Yat', (r) => r.regexp(/ě/, ['ie']))
    .rule(
      '[čšŕž] i→y',
      (r) => r.regexp(/([čšŕž])i/, ['$1y']),
      (p) => p.genesis('?S'),
    )
    .rule('Ų', (r) => r.regexp(/ų/, ['ą', 'ę']))
    .rule(
      'Ł',
      (r) => r.regexp(/l/, ['ł']),
      (p) => p.genesis('?S'),
    )
    //#endregion
    //#region Alphabet
    .section('Alphabet')
    .rule('Polish', (r) =>
      r.map({
        å: 'o',
        č: 'cz',
        ď: 'dz',
        h: 'ch',
        v: 'w',
        ğ: 'h',
        ĺ: 'l',
        ŕ: 'rz',
        ť: 'ć',
        š: 'sz',
        ž: 'ż',
      }),
    )
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
