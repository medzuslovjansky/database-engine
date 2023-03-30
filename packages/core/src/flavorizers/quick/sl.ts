import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Slovenian')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('Restore case', (r) => r.restoreCase())
    .build();
