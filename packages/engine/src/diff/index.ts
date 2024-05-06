import { exec as execCallback } from 'node:child_process';
import util from 'node:util';

const exec = util.promisify(execCallback);

export class DiffGenerator<T, C> {
  constructor(
    private readonly oldTag: string,
    private readonly newTag: string,
    private readonly deserialize: (
      fileName: string,
      content: string,
    ) => Promise<T | null>,
    private readonly compare: (before: T | null, after: T | null) => C | null,
    private readonly generateReport: (diffs: C[]) => string,
  ) {}

  async execute() {
    const files = await this.getChangedFiles();
    const maybeResults = await this.processFiles(files);
    const results = maybeResults.filter((result) => result != null) as C[];

    return this.generateReport(results);
  }

  private async processFiles(
    files: [string | null, string | null][],
  ): Promise<C[]> {
    const promises = files.map(async ([oldFile, newFile]) => {
      const oldData = oldFile
        ? await this.deserialize(
            oldFile,
            await this.getFileContent(this.oldTag, oldFile),
          )
        : null;
      const newData = newFile
        ? await this.deserialize(
            newFile,
            await this.getFileContent(this.newTag, newFile),
          )
        : null;
      const diff =
        oldData || newData ? await this.compare(oldData, newData) : null;

      return diff;
    });

    const result = await Promise.all(promises);
    return result.filter(Boolean) as C[];
  }

  private async getChangedFiles(): Promise<[string | null, string | null][]> {
    const output = await exec(
      `git diff --name-status ${this.oldTag} ${this.newTag}`,
    );

    const changes = output.stdout.trim().split('\n');
    return changes.map((change) => {
      const [type, file1, file2] = change.split('\t');
      switch (type) {
        case 'A': {
          return [null, file1];
        }
        case 'M': {
          return [file1, file1];
        }
        case 'D': {
          return [file1, null];
        }
        default: {
          return [file1, file2];
        }
      }
    });
  }

  private async getFileContent(tag: string, file: string) {
    const result = await exec(`git show ${tag}:${file}`);
    return result.stdout;
  }
}
