import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Slovak')
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
    .build();
