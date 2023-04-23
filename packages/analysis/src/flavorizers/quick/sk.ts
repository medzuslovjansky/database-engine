import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Slovak')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('råb', (r) => r.regexp(/råb/, ['rob']))
    .rule('råz', (r) => r.regexp(/råz/, ['roz']))
    .rule('sų', (r) => r.regexp(/sų/, ['sou']))
    .rule('vȯz', (r) => r.regexp(/vȯz/, ['vz']))
    .rule('sę', (r) => r.regexp(/\bsę\b/, ['se']))
    //#region KONCOVKY
    .section('Endings')
    .rule(
      '-ti',
      (r) => r.regexp(/ti\b/, ['t']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('-jųći', (r) => r.regexp(/jųći/, ['júci']))
    .rule('-je', (r) => r.regexp(/(?<=[cn])je\b/, ['ie']))
    //#endregion
    //#region Character
    .section('Character')
    .rule('Couple', (r) =>
      r.map({
        đu: 'zi',
        ću: 'ci',
        ju: 'ji',
        šč: 'šť',
        šć: 'šť',
        dj: 'ď',
        rj: 'ŕ',
        lj: 'ĺ',
        tj: 'ť',
        nj: 'ń',
      }),
    )
    .rule('Slovak alphabet', (r) =>
      r.map({
        å: 'a',
        ć: 'c',
        đ: 'z',
        ḓ: 'd',
        ę: 'ä',
        ė: 'e',
        g: 'h',
        h: 'ch',
        ľ: 'ľ',
        ń: 'ň',
        ȯ: 'o',
        ŕ: 'ŕ',
        ś: 's',
        ų: 'u',
        ź: 'z',
      }),
    )
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
