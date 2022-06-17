import multireplacer from '../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Ukrainian')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('De-Janizator', (r) =>
      r.map({ '’': '', ù: 'v', ḓ: '', è: 'ė', ı: '', ė: 'ě', ò: 'ȯ', ṙ: 'r' }),
    )

    //#region Closed syllables
    .section('Closed syllables')
    .rule('-ê-', (r) => r.regexp(/(?<=\S)e(?=\S)/, ['ê']))
    .rule('-ô-', (r) => r.regexp(/(?<=\S)o(?=\S)/, ['ô']))
    .rule('-ı-', (r) => r.regexp(/(?<=\S)i(?=\S)/, ['ı']))
    //#endregion

    //#region Prefixes
    .section('Prefixes')
    .rule('bez-', (r) => r.regexp(/bêz/, ['bez']))
    .rule('ne-', (r) => r.regexp(/nê/, ['ne']))
    .rule('vy-, iz-, z-', (r) =>
      r.regexp(/(?<=(^|\s|bez|ne))iz/, ['vy', 'z', 'iz']),
    )
    .rule('sȯ-', (r) => r.regexp(/(?<=s)ȯ/, ['ȯ', 'u', 'i', '']))
    .rule('s-', (r) => r.regexp(/(?<=(^|\s|ne))s/, ['s', 'z']))
    .rule('vid-, od-', (r) => r.regexp(/(?<=(^|\s|ne))od/, ['vid', 'od']))
    .rule('pry-', (r) => r.regexp(/prı/, ['pry']))
    .rule('pere-, pre-', (r) =>
      r.regexp(/(?<=(^|\s|bez|ne))prě/, ['pere', 'pre']),
    )
    .rule('roz-', (r) => r.regexp(/(?<=(^|\s|bez|ne))råz/, ['roz']))
    //#endregion

    //#region Suffixes
    .rule(
      'yva[tn]-uva[tn]',
      (r) => r.regexp(/y(?=va[tn])/, ['y', 'u']),
      (p) => p.partOfSpeech('v., adj., adv.'),
    )
    .rule('CЬk', (r) => r.regexp(/čs(?=k[ayeio]?(\s|$))/, ['cь']))
    .rule(
      'SЬk',
      (r) => r.regexp(/s(?=k[ayeio]?(\s|$))/, ['sь']),
      (p) => p.partOfSpeech('adj.,m.,n.'),
    )
    .rule('ZЬk', (r) => r.regexp(/z(?=k[ayeio]?(\s|$))/, ['z', 'zь']))
    //#endregion

    //#region Adverbs
    .section('Adverbs')
    .rule(
      '-iše',
      (r) => r.regexp(/ěje(?=\s|$)/, ['iše']),
      (p) => p.partOfSpeech('adv.'),
    )
    //#endregion

    //#region Nouns
    .section('Nouns')
    .rule(
      '-ecь',
      (r) => r.regexp(/[eêė]c(?=\s|$)/, ['ecь']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      '-ća',
      (r) => r.regexp(/ca(?=\s|$)/, ['cьa']),
      (p) => p.partOfSpeech('f.').and(p.genesis('?S')),
    )
    .rule(
      '-osť',
      (r) => r.regexp(/ôsť(?=\s|$)/, ['isť']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule(
      'neuter',
      (r) =>
        r.map({
          ĺje: 'llьa',
          ńje: 'nnьa',
          ťje: 'ttьa',
          ďje: 'ddьa',
          žje: 'zzьa',
          śje: 'ssьa',
          stje: 'stьa',
          sťje: 'stьa',
        }),
      (p) => p.partOfSpeech('n.'),
    )
    //#endregion

    //#region Adjectives
    .rule(
      '(n + ji) → nij',
      (r) => r.regexp(/(?<=n)ji(?=\s|$)/, ['ij']),
      (p) =>
        p
          .and(p.partOfSpeech('adj., m.'))
          .and(p.partOfSpeech('!m. pl.'))
          .and(p.partOfSpeech('!m. indecl.')),
    )
    .rule(
      'y/ji → yj',
      (r) => r.regexp(/(?<=\S)(?:j?i|y)(?=\s|$)/, ['yj']),
      (p) =>
        p
          .and(p.partOfSpeech('adj., m.'))
          .and(p.partOfSpeech('!m. pl.'))
          .and(p.partOfSpeech('!m. indecl.')),
    )
    //#endregion Adjectives

    //#region Verbs
    .rule(
      '-ti',
      (r) => r.regexp(/ti(?=\s|$)/, ['ty']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      '+sę',
      (r) => r.regexp(/ sę(?=\s|$)/, ['sę']),
      (p) => p.partOfSpeech('v. refl.'),
    )
    //#endregion Verbs

    //#region Roots
    .section('Roots')
    .rule('[LR]+Å (start)', (r) =>
      r.regexp(/(?<=(^|\s|bez|ne|roz)[rl])å/, ['o']),
    )
    .rule('[LR]+Å (middle)', (r) => r.regexp(/([rl])å/, ['o$1o']))
    .rule('[LR]+Ě (start)', (r) => r.regexp(/(?<=(^|\s|bez|ne)[rl])ě/, ['i']))
    .rule('[LR]+Ě (middle)', (r) =>
      r.regexp(/([rl])ě/, ['$1i', 'e$1e', 'o$1o']),
    )
    .rule('(dental/alveolar)+Ę', (r) => r.regexp(/([tdsznlr])ę/, ['$1ьa']))
    .rule('(soft/hissing)+Ę', (r) => r.regexp(/([čđšžćcj])ę/, ['$1a']))
    .rule('Ę (other cases)', (r) => r.regexp(/ę/, ["'ja"]))
    .rule('Syllabic -er-', (r) =>
      r.regexp(/ŕ(?=[bcćčdđeghklmnpsśštťvzžň])/, ['er']),
    )
    .rule('Syllabic -or-', (r) =>
      r.regexp(/([bdghkmpstv])r([bčdḓđfgkmnsštťvz])/, ['$1or$2', '$1ro$2']),
    )
    .rule('Syllabic -l-', (r) => r.regexp(/(?<=ȯ)l(?=[pk])/, ['ł']))
    .rule('-pȯlk- exception', (r) => r.regexp(/pȯłk/, ['pȯlk']))
    .rule(
      '-pijan-',
      (r) => r.regexp(/pıjan/, ['pjan']),
      (p) => p.genesis('?S'),
    )
    .rule('Ê - E/I', (r) => r.regexp(/ê/, ['e', 'i']))
    .rule('Ô - O/U/I', (r) => r.regexp(/ô/, ['o', 'i', 'u']))
    .rule('I - Y/İ', (r) => r.regexp(/ı/, ['y', 'i']))
    .rule('Đ - Ž/ĎŽ', (r) => r.regexp(/đ/, ['dž', 'ž']))
    .rule('je-', (r) => r.regexp(/(?<=(^|\s))e/, ['je', 'e']))
    .rule(
      '-κράτ-',
      (r) => r.regexp(/krac/, ['krat']),
      (p) => p.genesis('I'),
    )
    .rule('-by[tv]-', (r) => r.regexp(/by(?=[łtv])/, ['by', 'bu']))
    //#endregion

    //#region Phonetics
    .rule('-[mvp](j)en-', (r) => r.regexp(/(?<=[młvp])je/, ['le']))
    .rule('-[ln](j)en-', (r) => r.regexp(/(?<=[ln])jen/, ['en']))
    .rule('-r', (r) => r.regexp(/ŕ(?=\s|$)/, ['r']))
    .rule('šč', (r) => r.regexp(/čt/, ['šč']))
    .rule(
      'arhaJizm, ateJist, egoJist, altruJist',
      (r) => r.regexp(/([aeou])i/, ['$1ji']),
      (p) => p.genesis('I'),
    )
    .rule(
      'kurJoznyj',
      (r) => r.regexp(/io/, ['io', 'jo']),
      (p) => p.genesis('I'),
    )
    .rule(
      'abstraĞovati, _istorija',
      (r) => r.regexp(/h/, ['h', 'g', '']),
      (p) => p.genesis('I'),
    )
    .rule(
      'evolьucija, alьveola',
      (r) => r.regexp(/l(?!ь)/, ['l', 'lь']),
      (p) => p.genesis('I'),
    )
    .rule(
      'lьм',
      (r) => r.regexp(/lm/, ['lьm']),
      (p) => p.genesis('?S'),
    )
    .rule('cьк', (r) => r.regexp(/ck/, ['cьk']))
    .rule('Standardize', (r) =>
      r.map({
        å: 'o',
        ć: 'č',
        ď: 'dь',
        ė: 'e',
        ľ: 'lь',
        lj: 'lь',
        ń: 'nь',
        nj: 'nь',
        ȯ: 'o',
        ŕ: 'rь',
        ṙ: 'r',
        ś: 'sь',
        ť: 'tь',
        ų: 'u',
        ł: 'v',
        ź: 'zь',
      }),
    )
    .rule('Apostrophe', (r) =>
      r.regexp(/(?<=([bpvmfz]|[aouyier]\S))(j[aeui])/, ['$2', "'$2"]),
    )
    .rule('Cyrl-Ukr', (r) =>
      r.map({
        a: 'а',
        b: 'б',
        c: 'ц',
        č: 'ч',
        d: 'д',
        e: 'е',
        ě: 'і',
        f: 'ф',
        g: 'г',
        h: 'х',
        i: 'і',
        j: 'й',
        ja: 'я',
        je: 'є',
        ji: 'ї',
        ju: 'ю',
        k: 'к',
        l: 'л',
        m: 'м',
        n: 'н',
        o: 'о',
        p: 'п',
        r: 'р',
        s: 'с',
        š: 'ш',
        šč: 'щ',
        t: 'т',
        u: 'у',
        v: 'в',
        y: 'и',
        z: 'з',
        ž: 'ж',
        ьa: 'я',
        ьe: 'є',
        ьi: 'і',
        ьu: 'ю',
      }),
    )
    .rule('Restore case', (r) => r.restoreCase())
    .build();
