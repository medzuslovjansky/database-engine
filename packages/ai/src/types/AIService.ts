import { CompletionRequest } from './CompletionRequest';
import { BatchProcessor } from './BatchProcessor';

export interface AIService {
  /**
   * Single completion request - uses caching
   */
  complete(request: CompletionRequest): Promise<unknown>;

  /**
   * Creates a batch processor for multiple requests
   * Handles rate limiting, caching, and retries
   */
  createBatchProcessor<T = unknown>(options?: {
    batchSize?: number;
    requestsPerMinute?: number;
  }): BatchProcessor<T>;

  clearCache(): Promise<void>;
}
