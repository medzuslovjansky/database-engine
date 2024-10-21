import { Lemma } from '../lemma';

import { isVerified, stripMetacharacters } from './metacharacters';

export function parseSynset(rawString: string) {
  const sanitized = sanitize(rawString);
  const verified = isVerified(sanitized);
  const annotations = sanitized.includes('(')
    ? new AnnotationHelper()
    : new NoopAnnotationHelper();

  const lemmaString = annotations.stash(stripMetacharacters(sanitized).trim());
  const lemmas =
    lemmaString.length > 0
      ? lemmaString
          .split(lemmaString.includes(';') ? ';' : ',')
          .filter(Boolean)
          .map((value) => Lemma.parse(annotations.unstash(value.trim())))
      : [];

  return {
    verified,
    lemmas,
  };
}

function sanitize(str: string) {
  // Remove 00-31 and 7F
  // eslint-disable-next-line no-control-regex
  return str.replaceAll(/[\u0000-\u001F\u007F]/g, '');
}

class AnnotationHelper {
  map = new Map<string, string>();

  stash(str: string): string {
    let index = 0;
    return str.replaceAll(/\((\(*(?:[^()]*|\([^)]*\))*\)*)\)/g, (_0, match) => {
      const key = `ANNOTATION_${index++}`;
      this.map.set(key, `(${match})`);
      return key;
    });
  }

  unstash(str: string): string {
    return str.replaceAll(/(ANNOTATION_\d+)/g, (_0: unknown, match: string) => {
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
