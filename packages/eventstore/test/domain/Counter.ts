import { AggregateRoot, StreamIdentifier, Event } from '../../src';

/**
 * Specific event interfaces for the Counter aggregate
 */
export interface CounterCreatedEventData {
  initialValue: number;
}
export type CounterCreatedEvent = Event<'CounterCreated', CounterCreatedEventData>;

export interface CounterIncrementedEventData {
  amount: number;
}
export type CounterIncrementedEvent = Event<'CounterIncremented', CounterIncrementedEventData>;

export interface CounterDecrementedEventData {
  amount: number;
}
export type CounterDecrementedEvent = Event<'CounterDecremented', CounterDecrementedEventData>;

export interface CounterResetEventData {
  newValue: number;
}
export type CounterResetEvent = Event<'CounterReset', CounterResetEventData>;

/**
 * Union of all possible Counter events
 */
export type CounterEvent =
  | CounterCreatedEvent
  | CounterIncrementedEvent
  | CounterDecrementedEvent
  | CounterResetEvent;

/**
 * Counter aggregate state
 */
export interface CounterState {
  value: number;
}

/**
 * Simple Counter aggregate for testing
 */
export class Counter extends AggregateRoot<CounterState, CounterEvent> {
  constructor(id: string, revision = 0, state: CounterState = { value: 0 }) {
    super(new StreamIdentifier('counter', id), revision, state);
  }

  /**
   * Create a new counter
   */
  static create(id: string, initialValue = 0): Counter {
    const counter = new Counter(id);
    counter.raise('CounterCreated', { initialValue });
    return counter;
  }

  /**
   * Increment the counter by the given amount
   */
  increment(amount = 1): void {
    this.raise('CounterIncremented', { amount });
  }

  /**
   * Decrement the counter by the given amount
   */
  decrement(amount = 1): void {
    this.raise('CounterDecremented', { amount });
  }

  /**
   * Reset the counter to a new value
   */
  reset(newValue = 0): void {
    this.raise('CounterReset', { newValue });
  }

  /**
   * Apply events to update the state
   */
  protected doApply(event: CounterEvent): void {
    switch (event.type) {
      case 'CounterCreated':
        this.state = { value: event.data.initialValue };
        break;
      case 'CounterIncremented':
        this.state = { value: this.state.value + event.data.amount };
        break;
      case 'CounterDecremented':
        this.state = { value: this.state.value - event.data.amount };
        break;
      case 'CounterReset':
        this.state = { value: event.data.newValue };
        break;
    }
  }
}
