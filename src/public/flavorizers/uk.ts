import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Ukrainian')
    .rule('Prefix Separator', (r) => r.regexp(/’/, ['']))
    .rule('Od-', (r) => r.regexp(/od/, ['vid', 'od']))
    .rule('ORO-OLO', (r) => r.regexp(/([rl])å/, ['o$1o', '$1a', '$1o']))
    .rule('Western ḓ', (r) => r.regexp(/ḓ/, ['']))
    .rule('у-в', (r) => r.regexp(/ù/, ['v', 'u']))
    .rule('Little Yus after dental/alveolar', (r) =>
      r.regexp(/([tdsznlr])ę/, ['$1я']),
    )
    .rule('Little Yus after soft', (r) => r.regexp(/([čđšžćcj])ę/, ['$1a']))
    .rule('Little Yus after non dental/alveolar', (r) =>
      r.regexp(/([^tdsznlr])ę/, ["$1'я"]),
    )
    .rule('Ukr-GH', (r) => r.regexp(/h/, ['h', 'g']))
    .rule('ець', (r) => r.regexp(/èc/, ['ecь']))
    .rule('Fleeting O', (r) => r.regexp(/ò/, ['o', '']))
    .rule('Fleeting E', (r) => r.regexp(/è/, ['e', '']))
    .rule('Syllabic L', (r) =>
      r.regexp(/([^aåeěėèęiıjoȯòuųyяь'])[ŀl]([^aåeěėèęiıjoȯòuųyяь']|(\s|$))/, [
        '$1ov$2',
        '$1l$2',
      ]),
    )
    .rule('Syllabic Soft R', (r) =>
      r.regexp(/([^aåeěėèęiıjoȯòuųyяь'])ŕ([^aåeěėèęiıjoȯòuųyяь']|(\s|$))/, [
        '$1er$2',
        '$1ŕ$2',
      ]),
    )
    .rule('Syllabic Hard R', (r) =>
      r.regexp(/([^aåeěėèęiıjoȯòuųyяь'])[rṙ]([^aåeěėèęiıjoȯòuųyяь']|(\s|$))/, [
        '$1or$2',
        '$1r$2',
      ]),
    )
    .rule(
      'ıje',
      (r) => r.regexp(/([aåeěėęiıjoȯuųy])([lntdszr])ıje(?=\s|$)/, ['$1$2$2я']),
      (p) => p.partOfSpeech('noun'),
    )
    .rule(
      'stıje',
      (r) => r.regexp(/stıje(?=\s|$)/, ['stя']),
      (p) => p.partOfSpeech('noun'),
    )
    .rule(
      'ıji',
      (r) => r.regexp(/ıji(?=\s|$)/, ['yj', 'ovyj', 'ynyj', 'jačyj']),
      (p) => p.partOfSpeech('adj.,m.'),
    )
    .rule(
      'ji-ij',
      (r) => r.regexp(/ji(?=\s|$)/, ['ij']),
      (p) => p.partOfSpeech('adj.,m.'),
    )
    .rule(
      'y-yj i-yj',
      (r) => r.regexp(/[yi](?=\s|$)/, ['yj']),
      (p) => p.partOfSpeech('adj.,m.'),
    )
    .rule('Yat-R', (r) => r.regexp(/(\S)rė/, ['$1ere', '$1re']))
    .rule('Yat-L', (r) => r.regexp(/(\S)lė/, ['$1olo', '$1le']))
    .rule('DŽ', (r) => r.regexp(/đ/, ['дж', 'ж']))
    .rule('Jat', (r) => r.regexp(/ě/, ['i', 'e']))
    .rule('Iz-', (r) => r.regexp(/^(ne|bez)?iz/, ['$1vy', '$1z', '$1iz']))
    .rule('O-I', (r) => r.regexp(/o/, ['o', 'i']))
    .rule(
      'ovati-uvati',
      (r) => r.regexp(/ovati(?=\s|$)/, ['uvati', 'ovati']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('ovan-uvan', (r) => r.regexp(/ovan/, ['uvan', 'ovan']))
    .rule('Softening s/l/n + k', (r) =>
      r.regexp(/([sln])([k])/, ['$1ь$2', '$1$2']),
    )
    .rule(
      'Reflexive Verbs',
      (r) => r.regexp(/ (sя)(?=\s|$)/, ['$1']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'няти',
      (r) => r.regexp(/(яti|jati)(?=\s|$)/, ['jnjati']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'нятий',
      (r) => r.regexp(/(яty|jaty)(?=\s|$)/, ['jnjatyj']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Infinitive -ti',
      (r) => r.regexp(/ti(?=\s|$)/, ['ty']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('Ukr-IY', (r) => r.regexp(/i/, ['i', 'y']))
    .rule('Softening LJ NJ', (r) => r.regexp(/([ln])j/, ['$1ь']))
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
    .rule('Standardize', (r) =>
      r.map({
        å: 'a',
        ć: 'č',
        đ: 'dž',
        ď: 'd',
        ė: 'e',
        ę: 'e',
        ľ: 'l',
        ń: 'n',
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
    .rule('Cyrl-Ukr', (r) =>
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
        i: 'і',
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
        y: 'и',
        z: 'з',
        ž: 'ж',
      }),
    )
    .rule('Iotation', (r) =>
      r.map({
        ьа: 'я',
        ьу: 'ю',
        ье: 'є',
        йа: 'я',
        йя: 'я',
        йі: 'ї',
        йу: 'ю',
        йю: 'ю',
        йе: 'є',
      }),
    )
    .rule('щ', (r) => r.regexp(/шч/, ['щ', 'шч']))
    .build();
