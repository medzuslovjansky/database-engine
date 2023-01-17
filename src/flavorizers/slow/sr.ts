import multireplacer from '../../dsl/multireplacer';

export default () =>
  multireplacer
    .named('Interslavic → Serbian')
    .rule('Ignore case', (r) => r.lowerCase())
    //#region Suffixes
    .section('Suffixes')
    .rule('Alteration (-ova-)', (r) =>
      r.regexp(/(?!^|\s)ova(?!$|\s)/, ['ova', 'ira', 'a']),
    )
    //#endregion
    //#region Roots
    .section('Roots')
    .rule('Transposition (kto-tko)', (r) => r.regexp(/kto/, ['kto', 'tko']))
    .rule('Transposition (vse-sve)', (r) =>
      r.regexp(/v[sś](?=[aeěiuųy])/, ['vs', 'sv']),
    )
    .rule('Silencing (-gda-)', (r) => r.regexp(/gd/, ['d']))
    //#endregion
    //#region Nouns
    .section('Nouns')
    .rule(
      'Reduction (-ec)',
      (r) => r.regexp(/[eė]c(?=$|\s)/, ['ac']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Alteration (-elj)',
      (r) => r.regexp(/((?:at)?elj)(?=$|\s)/, ['elj', 'ač']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Expansion (-tȯr)',
      (r) => r.regexp(/tr(?=$|\s)/, ['tȯr']),
      (p) => p.partOfSpeech('m.'),
    )
    .rule(
      'Alteration (-nja)',
      (r) => r.regexp(/nja(?=$|\s)/, ['nja', 'nica']),
      (p) => p.partOfSpeech('f.'),
    )
    .rule(
      'Masculine (-a)',
      (r) => r.regexp(/([^a])(?=$|\s)/, ['$1a', '$1']),
      (p) => p.partOfSpeech('m.'),
    )
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
    .rule('collapse to ć', (r) => r.regexp(/(dt|kt|šn)/, ['$1', 'ć']))
    .rule('Muffled (-j-)', (r) => r.regexp(/([bpvmf])j/, ['$1j', '$1lj']))
    .rule('Muffled Z', (r) => r.regexp(/z([pftčsšk])/, ['s$1', 'z$1']))
    .rule('ŠČ-ŠT', (r) => r.regexp(/šč/, ['št']))
    .rule('DJ', (r) => r.regexp(/dj/, ['dj', 'đ']))
    .rule('DŽ', (r) => r.regexp(/dž/, ['dž', 'đ']))
    .rule('ŤB', (r) => r.regexp(/ťb/, ['db']))
    .rule('Jat', (r) => r.regexp(/ě/, ['e', 'i']))
    .rule('-L/O', (r) => r.regexp(/l(?=$|\s)/, ['l', 'o']))
    .rule('Hard Jer', (r) => r.regexp(/[òȯ]/, ['a']))
    .rule('Soft Jer', (r) => r.regexp(/[èė]/, ['a']))
    .rule('-zdn-', (r) => r.regexp(/zdn/, ['zn']))
    .rule('v/u-', (r) => r.regexp(/\bv/, ['v', 'u']))
    .rule('Unused etymology', (r) =>
      r.map({
        å: 'a',
        ď: 'd',
        ę: 'e',
        ě: 'e',
        ė: 'a',
        ĺ: 'l',
        ľ: 'l',
        ń: 'n',
        ŕ: 'r',
        ś: 's',
        ť: 't',
        ź: 'z',
        ı: '',
        ų: 'u',
        '’': '',
      }),
    )
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
    .rule('Restore case', (r) => r.restoreCase())
    .build();
