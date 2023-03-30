import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Slovak')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('Western G-H', (r) =>
      r.map({
        h: 'ch',
        g: 'h',
      }),
    )
    .rule('Č-ŠČ', (r) => r.regexp(/ć/, ['c']))
    //#region Reverse rules
    .section('Reverse rules')
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
