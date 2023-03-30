import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Russian')
    .rule('Ignore case', (r) => r.lowerCase())
    //#region По частям речи
    .section('По частям речи')
    .rule(
      'Гл: -овати',
      (r) => r.regexp(/ovati\b/, ['ovati', 'irovati']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Прил. -ован-',
      (r) => r.regexp(/ovan/, ['ovan', 'irovan']),
      (p) => p.partOfSpeech('adj., noun.'),
    )
    .rule(
      'Инфинитив (чь)',
      (r) => r.regexp(/[kg]ti\b/, ['čь']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Инфинитив (ь-ти)',
      (r) => r.regexp(/ti\b/, ['tь']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'sę',
      (r) => r.regexp(/ sę(?=$|\s)/, ['sę']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Прил.: -ческий',
      (r) => r.regexp(/čny\b/, ['českij', 'čny']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Прил.: -цкий',
      (r) => r.regexp(/čsky\b/, ['ckij']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Мягкие прилагательные',
      (r) => r.regexp(/ji\b/, ['ij']),
      (p) => p.partOfSpeech('adj.,m.'),
    )
    .rule(
      'Твердые прилагательные',
      (r) => r.regexp(/y\b/, ['yj', 'ij']),
      (p) => p.partOfSpeech('adj.,m.'),
    )
    //#endregion
    //#region Этимологическая русификация
    .section('Этимологическая русификация')
    .rule('ORO-OLO', (r) => r.regexp(/(\S)([lr])å/, ['$1$2a', '$1o$2o']))
    .rule('ra[bz]', (r) => r.regexp(/rå(?=[bz])/, ['ra']))
    .rule('Å-O', (r) => r.regexp(/å/, ['a', 'o']))
    .rule('Č-ŠČ', (r) => r.regexp(/ć/, ['č', 'šč']))
    .rule('ZŽ', (r) => r.regexp(/žđ/, ['zž']))
    .rule('ŽD', (r) => r.regexp(/đ/, ['žd', 'dž']))
    .rule('Muffled Z', (r) => r.regexp(/z(?=[pftsšk])/, ['s']))
    .rule('Little Yus (J)', (r) => r.regexp(/ję/, ['ja']))
    .rule('Little Yus (Non-J)', (r) => r.regexp(/ę/, ['ьa']))
    .rule('Lip', (r) => r.regexp(/([bpvmf])ja/, ['$1lja']))
    .rule('vų → ų', (r) => r.regexp(/(?<=^|\s)vų/, ['ų']))
    .rule('Softening', (r) =>
      r.map({
        ď: 'dь',
        ľ: 'lь',
        ĺ: 'lь',
        ń: 'nь',
        ŕ: 'rь',
        ś: 'sь',
        ť: 'tь',
        ź: 'zь',
      }),
    )
    .rule('Softening-LjNj', (r) =>
      r.map({
        lj: 'lь',
        nj: 'nь',
        rj: 'rь',
      }),
    )
    .rule('Letters', (r) =>
      r.map({
        ě: 'e',
        ė: 'e',
        ȯ: 'o',
        ų: 'u',
      }),
    )
    //#endregion
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
