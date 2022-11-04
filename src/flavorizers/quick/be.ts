import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Belarusian')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('Yat', (r) => r.regexp(/ě/, ['e']))
    .rule('Little Yus', (r) => r.regexp(/ę/, ['a', 'ьa']))
    .rule('Bid Yus VU', (r) => r.regexp(/vų/, ['vu', 'u']))
    .rule('ORO-OLO', (r) => r.regexp(/(\S)([rl])å/, ['$1o$2o']))
    .rule('ER', (r) => r.regexp(/rě/, ['ero', 'oro', 're']))
    .rule('EL', (r) => r.regexp(/lě/, ['ola', 'olo']))
    .rule('Unstressed E', (r) => r.regexp(/e/, ['e', 'ja']))
    .rule('Unstressed O', (r) => r.regexp(/o/, ['o']))
    .rule(
      '-ti',
      (r) => r.regexp(/ti\b/, ['ť']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('Standardize', (r) =>
      r.map({
        å: 'a',
        ć: 'č',
        đ: 'dž',
        ď: 'dь',
        ė: 'e',
        è: 'e',
        ę: 'e',
        ı: '',
        ľ: 'lь',
        ŀ: 'l',
        ń: 'nь',
        ò: 'o',
        ȯ: 'o',
        ŕ: 'r',
        ṙ: 'r',
        ś: 'sь',
        ť: 'cь',
        ų: 'u',
        ź: 'zь',
      }),
    )
    .rule('Cyrl-Standard', (r) =>
      r.map({
        a: 'а',
        b: 'б',
        c: 'ц',
        č: 'ч',
        d: 'д',
        e: 'е',
        f: 'ф',
        g: 'г',
        h: 'х',
        i: 'и',
        j: 'й',
        k: 'к',
        l: 'л',
        m: 'м',
        n: 'н',
        o: 'о',
        p: 'п',
        r: 'р',
        s: 'с',
        š: 'ш',
        t: 'т',
        u: 'у',
        v: 'в',
        y: 'ы',
        z: 'з',
        ž: 'ж',
      }),
    )
    .rule('Iotation', (r) =>
      r.map({
        ьа: 'я',
        ьо: 'ё',
        ьу: 'ю',
        йа: 'я',
        йя: 'я',
        йо: 'ё',
        йу: 'ю',
        йю: 'ю',
        йе: 'е',
      }),
    )
    .rule('Restore case', (r) => r.restoreCase())
    .build();
