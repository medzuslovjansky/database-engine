import multireplacer from '../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Latin letter replacer')
    .rule('Map', (r) =>
      r.map({
        e: 'е',
        y: 'у',
        i: 'і',
        p: 'р',
        a: 'а',
        j: 'ј',
        k: 'к',
        x: 'х',
        c: 'с',
      }),
    )
    .build();
