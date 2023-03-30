import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Ukrainian')
    .rule('Ignore case', (r) => r.lowerCase())

    //#region Prefixes
    .section('Prefixes')
    .rule('pry-', (r) => r.regexp(/pri/, ['pry']))
    //#endregion

    //#region Suffixes
    .rule(
      'yva[tn]-uva[tn]',
      (r) => r.regexp(/y(?=va[tn])/, ['u']),
      (p) => p.partOfSpeech('v., adj., adv.'),
    )
    .rule('čsk → ck, čn', (r) =>
      r.regexp(/čsk(?=[ayeio]?(\s|$))/, ['ck', 'čn']),
    )
    .rule('[sz]Ьk', (r) => r.regexp(/([sz])(?=k[ayeio]?(\s|$))/, ['$1ь']))
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
      (r) => r.regexp(/[eė]c(?=\s|$)/, ['ecь']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      '-ća',
      (r) => r.regexp(/ca(?=\s|$)/, ['cьa']),
      (p) => p.partOfSpeech('f.').and(p.genesis('?S')),
    )
    .rule(
      '-osť',
      (r) => r.regexp(/osť(?=\s|$)/, ['isť']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule(
      '-stje ending ',
      (r) => r.regexp(/s[tť]je(?=\s|$)/, ['stьa']),
      (p) => p.partOfSpeech('n.'),
    )
    .rule(
      'soft -je ending ',
      (r) => r.regexp(/([čďĺńťžź])je(?=\s|$)/, ['$1$1ьa']),
      (p) => p.partOfSpeech('n.'),
    )
    .rule(
      'soft -je ending (finalizer)',
      (r) =>
        r.map({
          ďďь: 'ddь',
          ĺĺь: 'llь',
          ťťь: 'ttь',
          źźь: 'zzь',
          ńńь: 'nnь',
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
      '-juvati',
      (r) => r.regexp(/jati(?=\s|$)/, ['jati', 'juvati']),
      (p) => p.partOfSpeech('v. ipf.'),
    )
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
    .rule('-glųb-', (r) => r.regexp(/glųb/, ['glyb']))
    .rule('-želųd-', (r) => r.regexp(/želųd/, ['žolųd']))
    .rule('no -povk-', (r) => r.regexp(/pȯlk/, ['polk']))
    .rule(
      '-pijan-',
      (r) => r.regexp(/pijan/, ['pjan']),
      (p) => p.genesis('?S'),
    )
    .rule('Lip', (r) => r.regexp(/([bpvmf])ja/, ['$1lja']))
    .rule('-oro-, -olo-', (r) => r.regexp(/(?<=\S)([rl])å/, ['o$1o', '$1å']))
    .rule('-ere-, -ele, -olo-, -i, -e', (r) =>
      r.regexp(/([rl])ě/, ['$1ě', 'e$1e', 'o$1o']),
    )
    .rule('Syllabic -er-', (r) =>
      r.regexp(/ŕ(?=[bcćčdđeghklmnpsśštťvzžň])/, ['er']),
    )
    .rule('Syllabic -or-', (r) =>
      r.regexp(/([bdghkmpstv])r([bčdḓđfgkmnsštťvz])/, ['$1or$2']),
    )
    .rule('Syllabic l→ł', (r) => r.regexp(/(?<=ȯ)l(?=[pkn])/, ['ł']))
    .rule('Ę before dental/alveolar', (r) => r.regexp(/([tdsznlr])ę/, ['$1ьa']))
    .rule('Ę before soft/hissing', (r) => r.regexp(/([čđšžćcj])ę/, ['$1a']))
    .rule('Ę (other cases)', (r) => r.regexp(/ę/, ['ja']))
    .rule('Ě - I/Y/E', (r) => r.regexp(/ě/, ['i']))
    .rule('Đ - Ž/ĎŽ', (r) => r.regexp(/đ/, ['dž']))
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
      'lьм',
      (r) => r.regexp(/lm/, ['lьm']),
      (p) => p.genesis('?S'),
    )
    .rule('-cьk-', (r) => r.regexp(/ck/, ['cьk']))
    .rule('-dcьatь-', (r) => r.regexp(/dsьatь/, ['dcьatь']))
    .rule('Standardize', (r) =>
      r.map({
        å: 'o',
        ć: 'č',
        ď: 'dь',
        ė: 'e',
        ĺ: 'lь',
        ľ: 'lь',
        lj: 'lь',
        ń: 'nь',
        nj: 'nь',
        ȯ: 'o',
        ŕ: 'r',
        rj: 'r',
        ṙ: 'r',
        ś: 'sь',
        ť: 'tь',
        ų: 'u',
        ł: 'v',
        ź: 'zь',
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
    .rule('Apostrophe', (r) =>
      r.regexp(/(?<=([бпвмфз]|[аоуіеяюєїр]\S))([яєюї])/, ['$2', "'$2"]),
    )
    .rule('Restore case', (r) => r.restoreCase())
    .build();
