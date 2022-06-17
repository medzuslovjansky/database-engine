import multireplacer from '../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Croatian')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('Southern sounds', (r) =>
      r.map({
        ĺ: 'љ',
        ń: 'њ',
        ŕ: 'р',
        t́: 'т',
        d́: 'д',
        ś: 'с',
        ź: 'з',
      }),
    )
    .rule('ŠČ-ŠT', (r) => r.regexp(/šč/, ['ć']))
    .rule('Ě', (r) => r.regexp(/ě/, ['e', 'ije']))
    .rule('L-O', (r) => r.regexp(/[lŀ]/, ['l', 'o']))
    .rule('Hard Jer', (r) => r.regexp(/[òȯ]/, ['a']))
    .rule('T-D', (r) => r.regexp(/ť/, ['t', 'd']))
    .rule('Big Yus', (r) => r.regexp(/ų/, ['u', 'a']))
    //#region Čest molvy
    .section('Čest molvy')
    .rule(
      'Glågoly',
      (r) => r.regexp(/ovati\b/, ['ovati', 'irati', 'ivati']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('Pridavniky', (r) => r.regexp(/čny\b/, ['čan']))
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
