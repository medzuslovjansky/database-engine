import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Croatian')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('Southern sounds', (r) =>
      r.map({
        d́: 'd',
        t́: 't',
        å: 'a',
        ė: 'a',
        ę: 'e',
        ě: 'je',
        ĺ: 'l',
        ń: 'n',
        ŕ: 'r',
        ś: 's',
        ų: 'u',
        ź: 'z',
        ȯ: 'a',
        y: 'i',
      }),
    )
    //#region Čest molvy
    .section('Čest molvy')
    .rule(
      '-ovati / -irati',
      (r) => r.regexp(/ovati\b/, ['ovati', 'irati']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('-čny → -čan', (r) => r.regexp(/čny\b/, ['čan']))
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
