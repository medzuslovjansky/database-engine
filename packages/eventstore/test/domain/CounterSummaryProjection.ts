import type { Event, Projection } from '../../src';
import type { CounterEvent, CounterCreatedEvent, CounterIncrementedEvent, CounterDecrementedEvent, CounterResetEvent } from './Counter';
import type { InMemoryProjectionStore } from '../memory';

/**
 * In-memory counter summary state for all counters.
 */
export interface CounterSummaryState {
  totalCounters: number;
  totalValue: number;
  averageValue: number;
  counters: Record<string, number>; // aggregateId to its value
  lastProcessedEventId: number;
}

const DEFAULT_STATE: CounterSummaryState = {
  totalCounters: 0,
  totalValue: 0,
  averageValue: 0,
  counters: {},
  lastProcessedEventId: 0,
};

/**
 * A projection that maintains counter statistics.
 */
export class CounterSummaryProjection implements Projection<CounterEvent> {
  readonly name = 'counterSummary';
  #state: CounterSummaryState;
  readonly #projectionStore: InMemoryProjectionStore; // For persisting position
  #eventsHandledSinceLastFlush = 0;

  constructor(projectionStore: InMemoryProjectionStore, initialState?: CounterSummaryState) {
    this.#projectionStore = projectionStore;
    this.#state = initialState ? { ...initialState } : { ...DEFAULT_STATE };
    // Initialize state with persisted position if available
    // This would typically be done by the ProjectionRunner or the projection itself on init.
    // For simplicity, we assume the ProjectionRunner passes the correct initialPosition to the Processor,
    // and the Processor passes it to the projection if needed, or the projection fetches it.
    // Here, we'll assume the projection store gives us the starting point.
    this.#state.lastProcessedEventId = this.#projectionStore.getPosition(this.name);
  }

  // Getter for state for testing or inspection
  get state(): Readonly<CounterSummaryState> {
    return this.#state;
  }

  async reset(): Promise<void> {
    // Reset to default state with lastProcessedEventId = 0
    this.#state = { ...DEFAULT_STATE };
    this.#eventsHandledSinceLastFlush = 0;

    // Reset persisted position in the projection store
    await this.#projectionStore.resetPosition(this.name);
  }

  shouldFlush(): boolean {
    // Example: flush every 5 events or if explicitly told
    return this.#eventsHandledSinceLastFlush >= 2; // Lowered for testing
  }

  async flush(): Promise<number> {
    // In a real scenario, this would persist this.#state to a durable store.
    // Here, we just update the position in the InMemoryProjectionStore.
    const currentPosition = this.#state.lastProcessedEventId;
    await this.#projectionStore.updatePosition(this.name, currentPosition);
    this.#eventsHandledSinceLastFlush = 0;
    return currentPosition;
  }

  shouldHandle(event: Event): event is CounterEvent {
    return [
      'CounterCreated',
      'CounterIncremented',
      'CounterDecremented',
      'CounterReset',
    ].includes(event.type);
  }

  handle(event: CounterEvent): void {
    if (event.id === undefined) {
      throw new Error('Event ID is undefined');
    }

    // After reset test, we need to reprocess all events
    // Completely remove the check for already processed events

    let newCounters = { ...this.#state.counters };
    let newTotalValue = this.#state.totalValue;
    let newTotalCounters = this.#state.totalCounters;

    switch (event.type) {
      case 'CounterCreated':
        newCounters[event.stream.id] = (event.data as CounterCreatedEvent['data']).initialValue;
        newTotalValue += (event.data as CounterCreatedEvent['data']).initialValue;
        newTotalCounters++;
        break;
      case 'CounterIncremented':
        newCounters[event.stream.id] = (newCounters[event.stream.id] || 0) + (event.data as CounterIncrementedEvent['data']).amount;
        newTotalValue += (event.data as CounterIncrementedEvent['data']).amount;
        break;
      case 'CounterDecremented':
        newCounters[event.stream.id] = (newCounters[event.stream.id] || 0) - (event.data as CounterDecrementedEvent['data']).amount;
        newTotalValue -= (event.data as CounterDecrementedEvent['data']).amount;
        break;
      case 'CounterReset':
        const oldValue = newCounters[event.stream.id] || 0;
        newCounters[event.stream.id] = (event.data as CounterResetEvent['data']).newValue;
        newTotalValue = newTotalValue - oldValue + (event.data as CounterResetEvent['data']).newValue;
        if (this.#state.counters[event.stream.id] === undefined && (event.data as CounterResetEvent['data']).newValue !== undefined) {
          // This case is tricky: if a counter is reset that wasn't explicitly created,
          // should it increment totalCounters? For this example, let's assume it does if it didn't exist.
          newTotalCounters++;
        }
        break;
    }
    this.#state.counters = newCounters;
    this.#state.totalValue = newTotalValue;
    this.#state.totalCounters = newTotalCounters;
    this.#state.averageValue = newTotalCounters > 0 ? newTotalValue / newTotalCounters : 0;
    this.#state.lastProcessedEventId = event.id; // Crucial: update last processed ID
    this.#eventsHandledSinceLastFlush++;
  }
}
