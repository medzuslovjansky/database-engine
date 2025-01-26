import type { z } from 'zod';

export interface AIService<Options extends AIServiceCompleteOptions = AIServiceCompleteOptions> {
  complete(
    requests: Iterable<AICompletionRequest>,
    options?: Options
  ): Promise<AIRequestHandle[]>;
}

export interface AICompletionRequest {
  messages: AICompletionMessage[];
  responseSchema?: z.ZodType;
}

export interface AICompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIServiceCompleteOptions {
  abortSignal?: AbortSignal;
  priority?: AICompletionPriority;
  noCache?: boolean;
}

export type AICompletionPriority =
  | 'immediate'  // Need result ASAP, willing to pay more
  | 'relaxed';   // Happy to wait, prefer cost savings

export type AICompletionRequestStatus =
  | 'pending'    // Not yet started
  | 'queued'     // In the rate-limited queue or batch
  | 'processing' // Being processed by OpenAI
  | 'completed'  // Done successfully
  | 'failed'     // Failed with error
  | 'cancelled'  // Cancelled by user
  | 'expired';   // Timed out

export interface AIRequestHandle {
  /**
   * Returns a promise that resolves with the completion result.
   * Can be called multiple times - returns the same promise.
   *
   * @param abortSignal Optional signal to cancel the request
   */
  value(abortSignal?: AbortSignal): Promise<string>;

  /**
   * Cancel this request
   */
  cancel(): Promise<void>;
}
