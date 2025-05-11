import type { EventEnvelope } from './EventEnvelope';

export type EventHandler = (event: EventEnvelope) => Promise<void> | void;

export class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  subscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) this.handlers.set(eventType, []);
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: EventEnvelope): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    // Run all handlers in parallel, fail fast if any reject
    await Promise.all(handlers.map(h => h(event)));
  }
}