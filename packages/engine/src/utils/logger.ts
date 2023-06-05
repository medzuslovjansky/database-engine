import { createLogger } from 'bunyan';
import { traceEventStream, noopLogger, wrapLogger } from 'bunyamin';

export const log = createBunyamin().child({ tid: 'sync', cat: 'sync' });

function createBunyamin() {
  const logger = isDebug()
    ? createLogger({
        name: 'isv',
        streams: [
          {
            level: 'trace',
            stream: traceEventStream({
              filePath: `isv-${YYYYDDMMHHMMSS()}.log`,
              threadGroups: [
                {
                  id: 'sync',
                  displayName: 'Sync',
                  maxConcurrency: 100_000,
                },
              ],
            }),
          },
        ],
      })
    : noopLogger();

  return wrapLogger(logger);
}

function isDebug() {
  return process.env.ISV_DEBUG === 'true';
}

function YYYYDDMMHHMMSS() {
  const d = new Date();
  return [
    d.getFullYear(),
    xx(d.getMonth()),
    xx(d.getDate()),
    xx(d.getHours()),
    xx(d.getMinutes()),
    xx(d.getSeconds()),
  ].join('-');
}

function xx(x: unknown) {
  return `${x}`.padStart(2, '0');
}
