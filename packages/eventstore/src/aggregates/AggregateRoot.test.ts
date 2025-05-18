import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StreamIdentifier } from '../primitives';
import { AggregateApplyError, InvalidEventRevisionError } from '../errors';
import { AggregateRoot } from './AggregateRoot';
import type { Event } from '../envelopes';

// Define test types for our test aggregate implementation
interface CounterState {
  count: number;
}

interface IncrementedEventData {
  amount?: number;
}

interface DecrementedEventData {
  amount?: number;
}

interface ResetEventData {}

// Define the event union type that matches what AggregateRoot expects
type CounterEvent =
  | Event<'incremented', IncrementedEventData>
  | Event<'decremented', DecrementedEventData>
  | Event<'reset', ResetEventData>;

// Concrete implementation of AggregateRoot for testing
class CounterAggregate extends AggregateRoot<CounterState, CounterEvent> {
  constructor(
    stream: StreamIdentifier,
    revision = 0,
    state: CounterState = { count: 0 }
  ) {
    super(stream, revision, state);
  }

  increment(amount = 1): void {
    this.raise('incremented', { amount });
  }

  decrement(amount = 1): void {
    this.raise('decremented', { amount });
  }

  reset(): void {
    this.raise('reset', {});
  }

  protected doApply(event: CounterEvent): void {
    switch (event.type) {
      case 'incremented':
        this.state = {
          ...this.state,
          count: this.state.count + (event.data.amount || 1),
        };
        break;

      case 'decremented':
        this.state = {
          ...this.state,
          count: this.state.count - (event.data.amount || 1),
        };
        break;

      case 'reset':
        this.state = { count: 0 };
        break;

      default:
        throw new Error(`Unknown event type: ${(event as any).type}`);
    }
  }

  // Method to throw an error during event application for testing
  throwDuringApply(_event: CounterEvent): void {
    throw new Error('Deliberate error during apply');
  }
}

describe('AggregateRoot', () => {
  let stream: StreamIdentifier;
  let aggregate: CounterAggregate;

  beforeEach(() => {
    stream = new StreamIdentifier('counter', '123');
    aggregate = new CounterAggregate(stream);
  });

  describe('constructor', () => {
    it('should initialize with the provided stream, revision, and state', () => {
      const initialState = { count: 10 };
      const initialRevision = 5;
      const aggregate = new CounterAggregate(stream, initialRevision, initialState);

      expect(aggregate.stream).toBe(stream);
      expect(aggregate.revision).toBe(initialRevision);
      expect(aggregate.state).toEqual(initialState);
    });

    it('should initialize with default state if not provided', () => {
      expect(aggregate.state).toEqual({ count: 0 });
      expect(aggregate.revision).toBe(0);
    });
  });

  describe('raise', () => {
    it('should create an event with the correct properties', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      aggregate.increment(5);
      const events = aggregate.pullEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'incremented',
        data: { amount: 5 },
        stream,
        ts: now,
        revision: 1,
      });
    });

    it('should increment the revision when raising events', () => {
      expect(aggregate.revision).toBe(0);

      aggregate.increment();
      expect(aggregate.revision).toBe(1);

      aggregate.decrement(2);
      expect(aggregate.revision).toBe(2);
    });

    it('should apply the event to the state', () => {
      aggregate.increment(5);
      expect(aggregate.state).toEqual({ count: 5 });

      aggregate.decrement(2);
      expect(aggregate.state).toEqual({ count: 3 });

      aggregate.reset();
      expect(aggregate.state).toEqual({ count: 0 });
    });

    it('should store uncommitted events until pulled', () => {
      aggregate.increment();
      aggregate.increment(2);

      const events = aggregate.pullEvents();
      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('incremented');
      expect(events[0].data).toEqual({ amount: 1 });
      expect(events[1].type).toBe('incremented');
      expect(events[1].data).toEqual({ amount: 2 });

      // Ensure events are cleared after pulling
      const emptyEvents = aggregate.pullEvents();
      expect(emptyEvents).toHaveLength(0);
    });
  });

  describe('loadFromHistory', () => {
    it('should apply events from history and update revision', () => {
      const events: CounterEvent[] = [
        {
          type: 'incremented',
          data: { amount: 5 },
          stream,
          revision: 1,
          ts: Date.now(),
        },
        {
          type: 'decremented',
          data: { amount: 2 },
          stream,
          revision: 2,
          ts: Date.now(),
        },
      ];

      aggregate.applyBatch(events);

      expect(aggregate.state).toEqual({ count: 3 });
      expect(aggregate.revision).toBe(2);

      // No uncommitted events should be created
      expect(aggregate.pullEvents()).toHaveLength(0);
    });

    it('should throw if event revisions are not sequential', () => {
      const events: CounterEvent[] = [
        {
          type: 'incremented',
          data: { amount: 5 },
          stream,
          revision: 1,
          ts: Date.now(),
        },
        {
          type: 'decremented',
          data: { amount: 2 },
          stream,
          revision: 3, // Gap in revision
          ts: Date.now(),
        },
      ];

      expect(() => aggregate.applyBatch(events)).toThrow(InvalidEventRevisionError);

      // The first event should have been applied
      expect(aggregate.state).toEqual({ count: 5 });
      expect(aggregate.revision).toBe(1);
    });
  });

  describe('apply', () => {
    it('should apply an event using doApply', () => {
      const event: CounterEvent = {
        type: 'incremented',
        data: { amount: 3 },
        stream,
        revision: 1,
        ts: Date.now(),
      };

      aggregate.apply(event);
      expect(aggregate.state).toEqual({ count: 3 });
    });

    it('should throw an AggregateApplyError if the aggregate is in a failed state', () => {
      // Create an event that will cause an error
      const errorEvent: CounterEvent = {
        type: 'incremented',
        data: { amount: 3 },
        stream,
        revision: 1,
        ts: Date.now(),
      };

      // Mock the doApply method to throw an error
      const mockDoApply = vi.spyOn(aggregate as any, 'doApply');
      mockDoApply.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      // Apply the event, which should put the aggregate in error state
      expect(() => aggregate.apply(errorEvent)).toThrow('Test error');

      // Attempting to apply another event should throw an AggregateApplyError
      const nextEvent: CounterEvent = {
        type: 'decremented',
        data: { amount: 1 },
        stream,
        revision: 2,
        ts: Date.now(),
      };

      expect(() => aggregate.apply(nextEvent)).toThrow(AggregateApplyError);
    });

    it('should store the error that occurred during apply', () => {
      const errorEvent: CounterEvent = {
        type: 'incremented',
        data: { amount: 3 },
        stream,
        revision: 1,
        ts: Date.now(),
      };

      // Mock the doApply method to throw an error
      const mockDoApply = vi.spyOn(aggregate as any, 'doApply');
      const testError = new Error('Test error');
      mockDoApply.mockImplementationOnce(() => {
        throw testError;
      });

      // Apply the event, which should put the aggregate in error state
      expect(() => aggregate.apply(errorEvent)).toThrow(testError);

      // Verify the error is stored by checking the AggregateApplyError message
      const nextEvent: CounterEvent = {
        type: 'decremented',
        data: { amount: 1 },
        stream,
        revision: 2,
        ts: Date.now(),
      };

      try {
        aggregate.apply(nextEvent);
        expect.fail('Should have thrown an AggregateApplyError');
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateApplyError);
        expect((error as Error).message).toContain('Failed to apply event decremented to aggregate counter/123');
      }
    });
  });
});
