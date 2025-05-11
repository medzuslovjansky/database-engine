import { createD1EventStoreRoot } from '../src/d1';

describe('D1EventStore', () => {
  let eventStore: ReturnType<typeof createD1EventStoreRoot>['eventStore'];

  beforeAll(async () => {
    // @ts-ignore
    const db = globalThis.__MINIFLARE_DB__;
    ({ eventStore } = createD1EventStoreRoot({ db }));
  });

  it('appends and reads back events in order', async () => {
    await eventStore.append([
      { stream: 'user-42', type: 'UserRegistered', data: { name: 'Ana' }, ts: Date.now() },
      { stream: 'user-42', type: 'EmailConfirmed', data: {}, ts: Date.now() }
    ]);

    const events = [];
    for await (const ev of eventStore.readStream('user-42')) events.push(ev);

    expect(events.length).toBe(2);
    expect(events[0].type).toBe('UserRegistered');
    expect(events[1].type).toBe('EmailConfirmed');
  });
});
