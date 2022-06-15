import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Serbian')
    .rule('Ignore case', (r) => r.lowerCase())
    //#region Prefixes
    .section('Prefixes')
    .rule('Alteration (vòz-)', (r) =>
      r.regexp(/vòz(?=$|\S)/, ['vòz', 'pod', 'vz']),
    )
    .rule('Alteration (pod-)', (r) => r.regexp(/pod(?=$|\S)/, ['pod', 'po']))
    .rule('Alteration (v-)', (r) => r.regexp(/(?=^|\s)v/, ['v', 'u']))
    .rule('Unvoicing (-d-)', (r) =>
      r.regexp(/(po|na)d(?![bdg])/, ['$1d', '$1t']),
    )
    .rule('Unvoicing (-z-)', (r) =>
      r.regexp(/(i|rå|u|vò)z(?![bdg])/, ['$1z', '$1s']),
    )
    //#endregion
    //#region Suffixes
    .section('Suffixes')
    .rule('Alteration (-ova-)', (r) =>
      r.regexp(/(?!^|\s)ova(?!$|\s)/, ['ova', 'ira', 'iva', 'a']),
    )
    //#endregion
    //#region Roots
    .section('Roots')
    .rule('Transposition (kto-tko)', (r) =>
      r.regexp(/kt(?=[aeiouy])/, ['kt', 'tk']),
    )
    .rule('Transposition (vse-sve)', (r) =>
      r.regexp(/vs(?=[aeěiuųy])/, ['vs', 'sv']),
    )
    .rule('Alteration (-gda-)', (r) => r.regexp(/gd/, ['gd', 'd']))
    //#endregion
    //#region Nouns
    .section('Nouns')
    .rule(
      'Feminization',
      (r) => r.regexp(/([^aåeěėęijoȯuųy])(?=$|\s)/, ['$1', '$1a']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Alteration (-telj)',
      (r) => r.regexp(/telj(?=$|\s)/, ['telj', 'č']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Alteration (-nik)',
      (r) => r.regexp(/ik(?=$|\s)/, ['ik', 'ar', 'čar', 'ičar']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Reduction (-ec)',
      (r) => r.regexp(/[eè]c(?=$|\s)/, ['ac']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Expansion (-tòr)',
      (r) => r.regexp(/tr(?=$|\s)/, ['tòr']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Masculinization',
      (r) => r.regexp(/([aåeěėęijoȯuųy])(?=$|\s)/, ['$1', '']),
      (p) => p.partOfSpeech('f.,n.'),
    )
    .rule(
      'Alteration (-nja)',
      (r) => r.regexp(/nja(?=$|\s)/, ['nja', 'nica']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule('Alteration (-enıje)', (r) => r.regexp(/enı/, ['enı', 'anı']))
    //#endregion
    //#region Adjectives
    .section('Adjectives')
    .rule(
      'Alterate ending',
      (r) => r.regexp(/(ičny|evy|č?sky)(?=$|\s)/, ['$1', 'sky', 'čny', 'čky']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Alteration (-ky)',
      (r) => r.regexp(/([^aåeěėęijoȯuųy])ky(?=$|\s)/, ['$1ky', '$1ak']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Alteration (-ny)',
      (r) => r.regexp(/([^aåeěėęijoȯuųy])ny(?=$|\s)/, ['$1ny', '$1an', '$1ky']),
      (p) => p.partOfSpeech('adj.'),
    )
    .rule(
      'Alteration (-y)',
      (r) => r.regexp(/(?!k)y(?=$|\s)/, ['y', '']),
      (p) => p.partOfSpeech('adj.'),
    )
    //#endregion
    //#region Adverbs
    .section('Adverbs')
    .rule(
      'Zero ending',
      (r) => r.regexp(/a(?=$|\s)/, ['a', '']),
      (p) => p.partOfSpeech('adv.'),
    )
    //#endregion
    //#region Verbs
    .section('Verbs')
    .rule(
      'Alteration (-jati)',
      (r) => r.regexp(/j(ati)(?=$|\s)/, ['j$1', 'v$1', 'iv$1']),
      (p) => p.partOfSpeech('v.'),
    )
    .rule(
      'Alteration (-ati)',
      (r) => r.regexp(/ati(?=$|\s)/, ['ati', 'avati']),
      (p) => p.partOfSpeech('v. ipf.'),
    )
    //#endregion
    //#region Phonetical changes
    .section('Phonetical changes')
    .rule('-l → -o', (r) => r.regexp(/l(?=$|\s)/, ['l', 'o']))
    .rule('-l(j) → -o (other cases)', (r) =>
      r.regexp(/lj?([mvn]|\b)/, ['l$1', 'o$1']),
    )
    .rule('collapse to ć', (r) => r.regexp(/(dt|kt|šn)/, ['$1', 'ć']))
    .rule('-zdn-', (r) => r.regexp(/zdn/, ['zdn', 'zn']))
    .rule('T-D', (r) => r.regexp(/ť/, ['t', 'd']))
    .rule('Unused etymology', (r) =>
      r.map({
        å: 'a',
        d́: 'd',
        ę: 'e',
        ė: 'ě',
        ĺ: 'l',
        ľ: 'l',
        ń: 'n',
        ŕ: 'r',
        ś: 's',
        ź: 'z',
        ı: '',
        ù: 'u',
        '’': '',
      }),
    )
    .rule('Big Yus', (r) => r.regexp(/ų/, ['u', 'a']))
    .rule('Muffled (-j-)', (r) => r.regexp(/([bpvmf])j/, ['$1j', '$1lj']))
    .rule('ŠČ-ŠT', (r) => r.regexp(/šč/, ['št']))
    .rule('DJ', (r) => r.regexp(/dj/, ['dj', 'đ']))
    .rule('Soft Jer', (r) => r.regexp(/è/, ['e', 'a']))
    .rule('H (silent)', (r) => r.regexp(/h/, ['h', '']))
    .rule('Syllabic L', (r) => r.regexp(/ŀ/, ['l', 'u']))
    .rule('Hard Jer', (r) => r.regexp(/[òȯ]/, ['o', 'a']))
    .rule('K-H', (r) => r.regexp(/k/, ['k', 'h']))
    .rule('DŽ', (r) => r.regexp(/dž/, ['dž', 'đ']))
    .rule('Yat', (r) => r.regexp(/[ěė]/, ['ě', 'i']))
    //#endregion
    //#region Alphabet
    .section('Alphabet')
    .rule('Cyrl-Standard', (r) =>
      r.map({
        a: 'а',
        b: 'б',
        c: 'ц',
        ć: 'ћ',
        č: 'ч',
        d: 'д',
        đ: 'ђ',
        e: 'е',
        ě: 'е',
        f: 'ф',
        g: 'г',
        h: 'х',
        i: 'и',
        j: 'ј',
        k: 'к',
        l: 'л',
        lj: 'љ',
        m: 'м',
        n: 'н',
        nj: 'њ',
        o: 'о',
        ò: 'а',
        ȯ: 'а',
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
    //#endregion
    .build();
