import { Lemma } from '../lemma';

import { isVerified, stripMetacharacters } from './metacharacters';

export function parseSynset(rawStr: string) {
  const verified = isVerified(rawStr);
  const annotations = rawStr.includes('(')
    ? new AnnotationHelper()
    : new NoopAnnotationHelper();

  const lemmaString = annotations.stash(stripMetacharacters(rawStr).trim());
  const lemmas =
    lemmaString.length > 0
      ? lemmaString
          .split(lemmaString.includes(';') ? ';' : ',')
          .map((value) => Lemma.parse(annotations.unstash(value.trim())))
      : [];

  return {
    verified,
    lemmas,
  };
}

class AnnotationHelper {
  map = new Map<string, string>();

  stash(str: string): string {
    let index = 0;
    return str.replace(/\((\(*(?:[^()]*|\([^)]*\))*\)*)\)/g, (_0, match) => {
      const key = `ANNOTATION_${index++}`;
      this.map.set(key, `(${match})`);
      return key;
    });
  }

  unstash(str: string): string {
    return str.replace(/(ANNOTATION_\d+)/g, (_0: unknown, match: string) => {
      return this.map.get(match) ?? '';
    });
  }
}

class NoopAnnotationHelper {
  stash(str: string): string {
    return str;
  }

  unstash(str: string): string {
    return str;
  }
}
