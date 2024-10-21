export function parseLemma(rawStr: string) {
  const str = trim(rawStr);
  const leftN = str.lastIndexOf('(');
  const rightN = str.lastIndexOf(')');
  if (rightN < leftN || (leftN === -1 && rightN !== -1)) {
    return { value: str, annotations: [] };
  }

  let value: string;
  let annotations: string[];

  if (rightN === str.length - 1) {
    value = str.slice(0, leftN).trimEnd();
    annotations = str
      .slice(leftN + 1, rightN)
      .split(';')
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
