import * as path from 'path';

const __project_root = path.join(__dirname, '..');

export default function __projectwise(pathSegment: string): string {
  return path.join(__project_root, pathSegment);
}
