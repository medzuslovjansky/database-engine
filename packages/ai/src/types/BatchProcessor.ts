import { CompletionRequest } from './CompletionRequest';

export interface BatchProcessor<T = unknown> {
  /**
   * Add items to the processing queue
   */
  enqueue(requests: CompletionRequest[]): void;

  /**
   * Subscribe to processed results
   */
  onResult(callback: (result: { request: CompletionRequest; response: T }) => void): void;

  /**
   * Subscribe to errors
   */
  onError(callback: (error: { request: CompletionRequest; error: Error }) => void): void;

  /**
   * Start processing the queue
   */
  start(): Promise<void>;

  /**
   * Stop processing and wait for current batch to complete
   */
  stop(): Promise<void>;
}
