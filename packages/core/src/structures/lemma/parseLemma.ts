export function parseLemma(rawStr: string) {
  const str = trim(rawStr);
  const leftN = str.lastIndexOf('(');
  const rightN = str.lastIndexOf(')');
  if (rightN < leftN || (leftN === -1 && rightN !== -1)) {
    throw new Error(`Lemma value has incorrect parentheses: ${str}`);
  }

  let value: string;
  let annotations: string[];

  if (rightN === str.length - 1) {
    value = str.slice(0, leftN).trimEnd();
    annotations = str
      .slice(leftN + 1, rightN)
      .split(';')
      // eslint-disable-next-line unicorn/no-array-callback-reference
      .map(trim);
  } else {
    value = str;
    annotations = [];
  }

  if (annotations[0] === '') {
    annotations.splice(0, 1);
  }

  return { value, annotations };
}

function trim(str: string): string {
  return str.trim();
}
