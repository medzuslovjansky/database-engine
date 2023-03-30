import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Belarusian')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule(
      'Инфинитив (ь-ти)',
      (r) => r.regexp(/ti\b/, ['ť']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'sę',
      (r) => r.regexp(/ sę(?=$|\s)/, ['sę']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('ARA-ALA', (r) => r.regexp(/(\S)([rl])å/, ['$1a$2a']))
    .rule('ra[bz]', (r) => r.regexp(/rå(?=[bz])/, ['ra']))
    .rule('Č-ŠČ', (r) => r.regexp(/ć/, ['č']))
    .rule('ZŽ', (r) => r.regexp(/žđ/, ['zž']))
    .rule('ŽD', (r) => r.regexp(/đ/, ['dž']))
    .rule('Muffled Z', (r) => r.regexp(/z(?=[pftsšk])/, ['s']))
    .rule('Little Yus (J)', (r) => r.regexp(/ję/, ['ja']))
    .rule('Little Yus (Non-J)', (r) => r.regexp(/ę/, ['ьa']))
    .rule('Lip', (r) => r.regexp(/([bpvmf])ja/, ['$1lja']))
    .rule('Softening', (r) =>
      r.map({
        ď: 'dzь',
        ĺ: 'lь',
        ń: 'nь',
        ŕ: 'rь',
        ś: 'sь',
        ť: 'cь',
        ź: 'zь',
      }),
    )
    .rule('Softening-LjNj', (r) =>
      r.map({
        lj: 'ль',
        nj: 'нь',
        rj: 'рь',
      }),
    )
    .rule('Standardize', (r) =>
      r.map({
        å: 'a',
        ć: 'č',
        đ: 'dž',
        ė: 'e',
        è: 'e',
        ę: 'ja',
        ě: 'e',
        ı: '',
        ľ: 'lь',
        ŀ: 'l',
        ń: 'nь',
        ò: 'o',
        ȯ: 'o',
        ŕ: 'r',
        ṙ: 'r',
        ś: 's',
        ť: 't',
        ų: 'u',
        ź: 'z',
      }),
    )
    //#region Кириллизација
    .section('Кириллизација')
    .rule('Yot-Glas', (r) => r.regexp(/(?<=[aeiouy])j(?=[aeiouy])/, ['']))
    .rule('Yot-Jo', (r) => r.regexp(/(?<=[^aeiouyь])j(?=[aeiouy])/, ['ъj']))
    .rule('Cyrl-Standard', (r) =>
      r.map({
        a: 'а',
        b: 'б',
        v: 'в',
        g: 'г',
        d: 'д',
        e: 'е',
        je: 'е',
        jo: 'ё',
        ьо: 'ё',
        ž: 'ж',
        z: 'з',
        ji: 'и',
        jy: 'и',
        j: 'й',
        k: 'к',
        l: 'л',
        m: 'м',
        n: 'н',
        o: 'о',
        p: 'п',
        r: 'р',
        s: 'с',
        i: 'и',
        t: 'т',
        u: 'у',
        f: 'ф',
        c: 'ц',
        č: 'ч',
        h: 'х',
        š: 'ш',
        sč: 'щ',
        šč: 'щ',
        y: 'ы',
        ju: 'ю',
        ьу: 'ю',
        ja: 'я',
        ьa: 'я',
      }),
    )
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
