import _ from 'lodash';
import { parse } from 'csv-parse';

export default function parseCSV(buffer, delimiter = ',') {
  return new Promise((resolve, reject) => {
    parse(buffer, { delimiter }, function (err, data) {
      if (err) {
        reject(err);
        return;
      }

      const [headers, ...rows] = data;
      const records = rows.map((row) =>
        _.transform(
          row,
          (acc, value, index) => {
            acc[headers[index]] = value;
          },
          {},
        ),
      );

      resolve(records);
    });
  });
}
