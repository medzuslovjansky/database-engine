import multireplacer from '../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Russian')
    .rule('Ignore case', (r) => r.lowerCase())
    //#region Этимологическая русификация
    .section('Этимологическая русификация')
    .rule('ORO-OLO', (r) => r.regexp(/(\S)([lr])å/, ['$1$2a', '$1o$2o']))
    .rule('Å-O', (r) => r.regexp(/å/, ['å', 'o']))
    .rule('Č-ŠČ', (r) => r.regexp(/ć/, ['č', 'šč']))
    .rule('ZŽ', (r) => r.regexp(/žđ/, ['zž']))
    .rule('ŽD', (r) => r.regexp(/đ/, ['žd', 'dž', 'ž']))
    .rule('Western D', (r) => r.regexp(/ḓ/, ['']))
    .rule('Little Yus (J)', (r) => r.regexp(/ję/, ['ja']))
    .rule('Little Yus (Non-J)', (r) => r.regexp(/ę/, ['ьa', 'е']))
    .rule('G/H/?', (r) => r.regexp(/h([aeiouy])/, ['h$1', 'g$1', '$1']))
    .rule('Big Yus VU', (r) => r.regexp(/vų/, ['u']))
    .rule('Big Yus JU', (r) => r.regexp(/jų/, ['ju']))
    .rule('Big Yus', (r) => r.regexp(/ų/, ['u', 'o']))
    .rule('U/W', (r) => r.regexp(/ù/, ['v', 'u']))
    .rule('Fleeting E', (r) => r.regexp(/[ėè]/, ['e', '']))
    .rule('Fleeting O', (r) => r.regexp(/[òȯ]/, ['o', '']))
    .rule('Syllabic Soft R', (r) =>
      r.regexp(/([^aåeěėęijoȯuųy])ŕ([^aåeěėęijoȯuųy])/, [
        '$1jer$2',
        '$1rje$2',
        '$1rjo$2',
      ]),
    )
    .rule('Syllabic Hard R', (r) =>
      r.regexp(/([^aåeěėęijoȯuųy])[rṙ]([^aåeěėęijoȯuųy])/, [
        '$1or$2',
        '$1ro$2',
        '$1er$2',
        '$1re$2',
      ]),
    )
    .rule('Syllabic L', (r) =>
      r.regexp(/([^aåeěėęijoȯuųy])[ŀl]([^aåeěėęijoȯuųy])/, [
        '$1oŀ$2',
        '$1joŀ$2',
        '$1ŀo$2',
        '$1ŀjo$2',
      ]),
    )
    .rule('Syllabic R/L - Finalization', (r) =>
      r.map({
        ṙ: 'r',
        ŀ: 'l',
      }),
    )
    .rule('Softening', (r) =>
      r.map({
        ď: 'dь',
        ľ: 'lь',
        ń: 'nь',
        ŕ: 'rь',
        ś: 'sь',
        ť: 'tь',
        ź: 'zь',
      }),
    )
    .rule('Softening-LjNj', (r) =>
      r.map({
        lj: 'ль',
        nj: 'нь',
      }),
    )
    .rule('Softening-Rj', (r) => r.regexp(/rj/, ['rь', 'r']))
    .rule('IIJ', (r) => r.regexp(/ıji/, ['ij']))
    .rule('I-Ь', (r) => r.regexp(/ı/, ['и', 'ь']))
    .rule('Yat-L', (r) => r.regexp(/(\S)lě/, ['$1le', '$1ele', '$1olo']))
    .rule('Yat-R', (r) => r.regexp(/(\S)rě/, ['$1re', '$1ere', '$1ri', '$1er']))
    .rule('Yat', (r) => r.regexp(/ě/, ['e']))
    .rule('Iz-', (r) => r.regexp(/^(ne|bez)?iz/, ['$1vy', '$1iz', '$1s']))
    .rule('Muffled Z', (r) => r.regexp(/z([pftsšk])/, ['s$1', 'z$1']))
    .rule('Prefix Separator', (r) => r.regexp(/’/, ['']))
    //#endregion
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
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Сущ. -ован-',
      (r) => r.regexp(/ovan/, ['ovan', 'irovan']),
      (p) => p.partOfSpeech('noun'),
    )
    .rule(
      'Инфинитив (чь)',
      (r) => r.regexp(/[kg]ti\b/, ['čь']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Инфинитив (ь-ти)',
      (r) => r.regexp(/ti\b/, ['tь', 'ti']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Инфинитив (ся)',
      (r) => r.regexp(/(se|sьa)\b/, ['$1']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Прил.: -ческий',
      (r) => r.regexp(/čny\b/, ['českij', 'čnyj']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Прил.: -цкий',
      (r) => r.regexp(/čsky\b/, ['ckij']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Прил.: -ая',
      (r) => r.regexp(/([aeiouy])na\b/, ['$1nnaja', '$1naja']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule(
      'Удвоение НН',
      (r) => r.regexp(/([aeiouy])n([aeiyo])\b/, ['$1nn$2', '$1n$2']),
      (p) => p.partOfSpeech('adj.,noun'),
    )
    .rule(
      'Мягкие прилагательные',
      (r) => r.regexp(/ji\b/, ['ij']),
      (p) => p.partOfSpeech('adj.,m.'),
    )
    .rule(
      'Твердые прилагательные',
      (r) => r.regexp(/y\b/, ['yj', 'ij', 'oj']),
      (p) => p.partOfSpeech('adj.,m.'),
    )
    //#endregion
    //#region Кириллизација
    .section('Кириллизација')
    .rule('Yot-Glas', (r) => r.regexp(/([aeiouy])j([ei])/, ['$1$2']))
    .rule('Yot-Ja', (r) => r.regexp(/([^aåeėioȯuųy])ja/, ['$1я', '$1ъя']))
    .rule('Yot-Ije', (r) => r.regexp(/ьje/, ['ье', 'ие']))
    .rule('Yot-Je', (r) =>
      r.regexp(/([^aåeėioȯuųyь])je/, ['$1ье', '$1ъе', '$1е']),
    )
    .rule(
      'Yot-JiEnd',
      (r) => r.regexp(/([^aåeėioȯuųyь])ji\b/, ['$1ий']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule('Yot-Ji', (r) => r.regexp(/([^aåeėioȯuųyь])ji/, ['$1ьи', '$1и']))
    .rule('Yot-Jo', (r) => r.regexp(/([^aåeėioȯuųyь])jo/, ['$1ъё', '$1ьо']))
    .rule('Yot-Ju', (r) => r.regexp(/([^aåeėioȯuųyь])ju/, ['$1ю', '$1ъю']))
    .rule('Yot-Jy', (r) => r.regexp(/([^aåeėioȯuųyь])jy/, ['$1ы']))
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
    .rule('Губная', (r) => r.regexp(/([бпвмф])ъя/, ['$1ля', '$1ъя']))
    .rule('Йотация', (r) =>
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
    .rule('Щ', (r) => r.regexp(/[сш]ч/, ['щ']))
    //#endregion
    //#region Эвристики
    .section('Эвристики')
    .rule('Обезёкивание', (r) => r.regexp(/ё/, ['е']))
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
