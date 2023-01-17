import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Czech')
    .rule('Ignore case', (r) => r.lowerCase())
    .rule('de-Janizator', (r) =>
      r.map({
        è: 'e',
        ı: 'i',
        ŀ: 'l',
        ò: 'ȯ',
        ù: 'u',
        ṙ: 'r',
        '’': '',
      }),
    )
    .rule('Western D', (r) => r.regexp(/ḓ/, ['d', '']))
    .rule('Prefix IZ→VY', (r) => r.regexp(/^iz/, ['vy', 'z', 'ze', 's', 'se']))
    .rule('Prefix 2', (r) => r.regexp(/^råz/, ['roz']))
    .rule('Prefix 3', (r) => r.regexp(/^sų/, ['s', 'se', 'sou']))
    .rule('Prefix 4', (r) => r.regexp(/^vȯz/, ['vz']))
    //#region KONCOVKY
    .section('KONCOVKY')
    .rule(
      'Ending 1',
      (r) => r.regexp(/\bsę\b/, ['se']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Ending 2',
      (r) => r.regexp(/ti\b/, ['t']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Ending 3',
      (r) => r.regexp(/nųt/, ['nout']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('Ending 4', (r) => r.regexp(/jųći/, ['jící']))
    .rule('Ending 5', (r) => r.regexp(/ȯ(.)\b/, ['e$1']))
    .rule('Ending 6', (r) => r.regexp(/ŕ\b/, ['ř']))
    .rule('Ending 7', (r) => r.regexp(/(\s)sę/, ['$1se']))
    .rule('Ending 8', (r) => r.regexp(/mę\b/, ['mě']))
    //#endregion
    //#region Couple
    .section('Couple')
    .rule('Couple 1', (r) => r.regexp(/đu/, ['zi']))
    .rule('Couple 2', (r) => r.regexp(/ću/, ['ci']))
    .rule(
      'Couple 3',
      (r) => r.regexp(/ju/, ['ji']),
      (p) => p.genesis('?S'),
    )
    .rule('Couple 4', (r) => r.regexp(/šč|šć/, ['šť']))
    .rule('Couple 5', (r) => r.regexp(/dj/, ['ď']))
    .rule('Couple 6', (r) => r.regexp(/tj/, ['ť']))
    .rule(
      'Couple 7',
      (r) => r.regexp(/nj/, ['ň']),
      (p) => p.genesis('?S'),
    )
    .rule('Couple 8', (r) => r.regexp(/rj/, ['ř']))
    //#endregion
    //#region Roots
    .section('Roots')
    .rule('Root 1', (r) => r.regexp(/råb/, ['rob']))
    //#endregion
    //#region Character
    .section('Character')
    .rule('Char 1', (r) =>
      r.map({
        å: 'a',
        ć: 'c',
        ė: 'e',
        ľ: 'l',
        ń: 'ň',
        ŕ: 'r',
        ś: 's',
        ź: 'z',
      }),
    )
    .rule('Char 2', (r) => r.regexp(/([^c])h/, ['$1ch', '$1g']))
    .rule('Char 3', (r) => r.regexp(/g/, ['h', 'g']))
    .rule('Char 4', (r) => r.regexp(/đ/, ['z', 'dj']))
    .rule('Char 5', (r) => r.regexp(/ḓ/, ['d']))
    .rule('Char 6', (r) => r.regexp(/ę/, ['je', 'ja']))
    .rule('Char 7', (r) => r.regexp(/ų/, ['u', 'ou']))
    .rule('Char 8', (r) => r.regexp(/ȯ/, ['e', '']))
    //#endregion
    //#region Verbs
    .section('Verbs')
    .rule(
      'Term 1',
      (r) => r.regexp(/([čšžř])at\b/, ['$1et']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 2',
      (r) => r.regexp(/vjat(?=$|\s)/, ['vět']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 3',
      (r) => r.regexp(/njat(?=$|\s)/, ['nět', 'nit']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 20',
      (r) => r.regexp(/kt(?=$|\s)/, ['ct', 'ci']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 21',
      (r) => r.regexp(/([bdghmnrv])t(?=$|\s)/, ['$1at']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 22',
      (r) => r.regexp(/avat(?=$|\s)/, ['ávat']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 23',
      (r) => r.regexp(/evat(?=$|\s)/, ['évat', 'ovat']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 24',
      (r) => r.regexp(/ivat(?=$|\s)/, ['ívat']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Term 25',
      (r) => r.regexp(/yvat(?=$|\s)/, ['ývat']),
      (p) => p.partOfSpeech('v.'),
    )
    //#endregion
    //#region Nouns (masculine)
    .section('Nouns (masculine)')
    .rule(
      'Replacement (-izm)',
      (r) => r.regexp(/izm(?=$|\s)/, ['ismus']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Replacement (-ij)',
      (r) => r.regexp(/ij(?=$|\s)/, ['ium']),
      (p) => p.partOfSpeech('m.').and(p.genesis('I')),
    )
    .rule(
      'Replacement (-ator)',
      (r) => r.regexp(/ator(?=$|\s)/, ['átor']),
      (p) => p.partOfSpeech('m.anim.'),
    )
    .rule(
      'Replacement (-ist)',
      (r) => r.regexp(/ist(?=$|\s)/, ['ista']),
      (p) => p.partOfSpeech('m.anim.'),
    )
    //#endregion
    //#region Nouns (feminine)
    .section('Nouns (feminine)')
    .rule(
      'Alteration (-ija)',
      (r) => r.regexp(/(\S\S)ija(?=$|\s)/, ['$1ie', '$1sko', '$1e']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule(
      'TODO: Alteration (-?ňa)',
      (r) => r.regexp(/([^aeěiouy])ňa(?=$|\s)/, ['$1eň', '$1na']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule(
      'TODO: Alteration (-ňa)',
      (r) => r.regexp(/ňa(?=$|\s)/, ['ně', 'ň']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule(
      'TODO: Alternation (-?a)',
      (r) => r.regexp(/([cčšřžjľďťň])a(?=$|\s)/, ['$1e']),
      (p) => p.partOfSpeech('f.').and(p.genesis('?S')),
    )
    .rule(
      'TODO: Replacement (-sť)',
      (r) => r.regexp(/sť(?=$|\s)/, ['st']),
      (p) => p.partOfSpeech('f.'),
    )
    //#endregion
    //#region Nouns (neuter)
    .section('Nouns (neuter)')
    .rule(
      'TODO: Replacement (-aní)',
      (r) => r.regexp(/([žščřcjďťň])aní(?=$|\s)/, ['$1ení']),
      (p) => p.partOfSpeech('n.'),
    )
    .rule(
      'Term 11',
      (r) => r.regexp(/([cčsšrřzžbvmplľdďtťnň])j([aei])(?=$|\s)/, ['$1jí']),
      (p) => p.partOfSpeech('n.'),
    )
    //#endregion
    //#region Adjectives
    .section('Adjectives')
    .rule(
      'Alteration (-ny)',
      (r) => r.regexp(/(?=n)y(?=$|\s)/, ['ý', 'í']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Replacement (-y)',
      (r) => r.regexp(/(?!n)y(?=$|\s)/, ['ý']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Replacement (-i)',
      (r) => r.regexp(/i(?=$|\s)/, ['í']),
      (p) => p.partOfSpeech('adj.'),
    )
    //#endregion
    //#region Trigrams
    .section('Trigrams')
    .rule('Replacement (-srě-, -črě-)', (r) => r.regexp(/srě|črě/, ['stře']))
    .rule('Replacement (-cvě-)', (r) => r.regexp(/cvě/, ['kvě']))
    .rule(
      'TODO: -?ju',
      (r) => r.regexp(/([bcfghklľmpqrsšvzžďťň])ju/, ['$1i']),
      (p) => p.genesis('?S'),
    )
    .rule('Replacement (-mhl-)', (r) => r.regexp(/mhl/, ['mlh']))
    //#endregion
    //#region Bigrams
    .section('Bigrams')
    .rule(
      'Replacement (-ri?-)',
      (r) => r.regexp(/ri(?![^aeěiouy])/, ['ři']),
      (p) => p.genesis('?S'),
    )
    .rule('Alteration (-rě-)', (r) => r.regexp(/rě/, ['ře', 'ří']))
    .rule('TODO: Replacement (-?j-)', (r) =>
      r.regexp(/([bcčfghklmpqřsšvzžďťň])j/, ['$1']),
    )
    .rule('TODO: Replacement (-?ě-)', (r) =>
      r.regexp(/([cčsšrřzžjlďťň])ě/, ['$1e']),
    )
    .rule('TODO: Replacement: (-rj-)', (r) => r.regexp(/rj/, ['ř']))
    .rule('TODO: Replacement: (-av-)', (r) => r.regexp(/av(?=[rt])/, ['au']))
    //#endregion
    //#region Reduction
    .section('Reduction')
    .rule('Red 1', (r) => r.regexp(/čr([^t])/, ['čer$1']))
    .rule('Red 2', (r) => r.regexp(/([ij])dt/, ['jít']))
    //#endregion
    //#region Correction
    .section('Correction')
    .rule('Cor 1', (r) => r.regexp(/jj/, ['j']))
    .rule('Cor 2', (r) => r.regexp(/mje/, ['mě']))
    .rule('Cor 3', (r) => r.regexp(/vje/, ['vě']))
    .rule('Cor 4', (r) => r.regexp(/ďí|ďi/, ['dí']))
    .rule('Cor 5', (r) => r.regexp(/ťí|ťi/, ['tí']))
    .rule('Cor 6', (r) => r.regexp(/ňí|ňi/, ['ní']))
    .rule('Cor 7', (r) => r.regexp(/ďe/, ['dě']))
    .rule('Cor 8', (r) => r.regexp(/ťe/, ['tě']))
    .rule('Cor 9', (r) => r.regexp(/ňe/, ['ně']))
    .rule(
      'Cor 10',
      (r) => r.regexp(/ss/, ['ses']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule('Cor 11', (r) => r.regexp(/ss/, ['s']))
    .rule('Cor 12', (r) => r.regexp(/ks/, ['x']))
    //#endregion
    //#region Reverse transforms
    .section('Reverse transforms')
    .rule('Long vowels', (r) =>
      r.map({
        á: 'a',
        í: 'i',
        ý: 'y',
      }),
    )
    //#endregion
    .rule('Restore case', (r) => r.restoreCase())
    .build();
