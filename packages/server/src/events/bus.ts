import type { Event, EventName, TypedEvent } from '@app/schema';

/**
 * Simple event bus that allows subscribing to and publishing events
 */
export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<EventName, Array<(event: TypedEvent<EventName>) => Promise<void>>> = new Map();
  private immediateProcessing: boolean = true;

  private constructor() {}

  /**
   * Get singleton instance of EventBus
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Set event processing mode
   * @param immediate If true, events are processed immediately when published
   */
  setImmediateProcessing(immediate: boolean): boolean {
    const prev = this.immediateProcessing;
    this.immediateProcessing = immediate;
    return prev;
  }

  /**
   * Subscribe to events of a specific type
   * @param eventType Type of event to subscribe to
   * @param handler Function to handle the event
   */
  subscribe(eventType: EventName, handler: (event: TypedEvent<EventName>) => Promise<void>): void {
    const handlers = this.subscribers.get(eventType) || [];
    handlers.push(handler);
    this.subscribers.set(eventType, handlers);
  }

  /**
   * Publish an event to all subscribers
   * @param event Event to publish
   */
  async publish(event: TypedEvent<EventName>): Promise<void> {
    console.log('[EventBus] Publishing event:', event.type, event);
    if (!this.immediateProcessing) {
      return; // Skip processing in deferred mode
    }

    const handlers = this.subscribers.get(event.type as EventName) || [];
    console.log('[EventBus] Found handlers:', handlers.length, 'for event type:', event.type);

    for (const handler of handlers) {
      try {
        console.log('[EventBus] Invoking handler for event:', event.type);
        await handler(event);
      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
        // Could implement retry logic or more sophisticated error handling
      }
    }
  }

  /**
   * Process a specific event through all subscribers
   * Used for rebuilding state from stored events
   * @param event Event to process
   */
  async processEvent(event: TypedEvent<EventName>): Promise<void> {
    const handlers = this.subscribers.get(event.type as EventName) || [];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
      }
    }
  }
}
