import { AggregateRegistry, ProjectionRegistry } from '../../src';

/**
 * Utility function to create a fresh AggregateRegistry for tests
 * This ensures each test has its own clean registry
 */
export function createFreshAggregateRegistry(): AggregateRegistry {
  return new AggregateRegistry();
}

/**
 * Utility function to create a fresh ProjectionRegistry for tests
 * This ensures each test has its own clean registry
 */
export function createFreshProjectionRegistry(): ProjectionRegistry {
  return new ProjectionRegistry();
}
