import _ from 'lodash';
import parse from 'csv-parse';

export async function parseCSV(
  buffer: Buffer | string,
): Promise<Record<string, string>[]> {
  const rawRecords = await new Promise<Record<string, string>[]>(
    (resolve, reject) => {
      parse(buffer, function (err, data) {
        if (err) {
          return reject(err);
        }

        const [headers, ...rows] = data as string[][];
        const records = rows.map((row) => {
          return _.transform(
            row,
            (acc, value, index) => {
              acc[headers[index]] = value;
            },
            {} as Record<string, string>,
          );
        });

        resolve(records);
      });
    },
  );

  return rawRecords;
}
