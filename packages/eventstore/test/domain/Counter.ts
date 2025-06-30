import type { Event } from '../../src';
import { AggregateRoot, StreamIdentifier } from '../../src';

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
  /**
   * Create a new counter
   */
  static create(id: string, value?: number): Counter {
    const counter = new Counter(new StreamIdentifier('counter', id), 0, { value: 0 });
    counter.reset(value);
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
  protected override doApply(event: CounterEvent): void {
    switch (event.type) {
      case 'CounterCreated': {
        this.state = { value: event.data.initialValue };
        break;
      }
      case 'CounterIncremented': {
        this.state = { value: this.state.value + event.data.amount };
        break;
      }
      case 'CounterDecremented': {
        this.state = { value: this.state.value - event.data.amount };
        break;
      }
      case 'CounterReset': {
        this.state = { value: event.data.newValue };
        break;
      }
    }
  }
}
