import {AICompletionRequest, AIRequestHandle, AICompletionRequestStatus } from '../../types/AIService';
import { makeDeferred } from '../Deferred';
import { OpenAIRequestConfig } from './OpenAIRequestConfig';

export class OpenAIRequestHandle implements AIRequestHandle {
  #status: AICompletionRequestStatus = 'pending';
  #deferred = makeDeferred<string>();
  #cacheKey: string;
  #config: OpenAIRequestConfig;

  constructor(config: OpenAIRequestConfig) {
    this.#config = config;
    this.#cacheKey = this.#buildCacheKey(config.request);
    this.#start();
  }

  #buildCacheKey(request: AICompletionRequest): string {
    const key = request.messages.map(m => `${m.role}:${m.content}`).join('|');
    return `completion:${key}`;
  }

  async #start(): Promise<void> {
    try {
      // First check cache
      if (!this.#config.options.noCache) {
        const cached = await this.#config.cache.get<string>(this.#cacheKey);
        if (cached) {
          this.#status = 'completed';
          this.#deferred.resolve(cached);
          return;
        }
      }

      // If not in cache, queue for processing
      this.#config.throttler.execute(async () => {
        try {
          this.#status = 'processing';
          const result = await this.#processRequest();

          // Cache the result if needed
          if (!this.#config.options.noCache) {
            await this.#config.cache.set(this.#cacheKey, result);
          }

          this.#status = 'completed';
          this.#deferred.resolve(result);
        } catch (error) {
          this.#status = 'failed';
          this.#deferred.reject(error);
        }
      });
    } catch (error) {
      this.#status = 'failed';
      this.#deferred.reject(error);
    }
  }

  async #processRequest(): Promise<string> {
    const completion = await this.#config.client.chat.completions.create({
      model: this.#config.options.model,
      temperature: this.#config.options.temperature,
      max_tokens: this.#config.options.maxTokens,
      messages: this.#config.request.messages,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Parse if schema provided
    if (this.#config.request.responseSchema) {
      const parsed = JSON.parse(content);
      return JSON.stringify(this.#config.request.responseSchema.parse(parsed));
    }

    return content;
  }

  value(abortSignal?: AbortSignal): Promise<string> {
    const onAbort = () => this.cancel();
    abortSignal?.addEventListener('abort', onAbort, { once: true });
    this.#deferred.promise.finally(() => abortSignal?.removeEventListener('abort', onAbort));

    return this.#deferred.promise;
  }

  async cancel(): Promise<void> {
    if (this.#status !== 'completed' && this.#status !== 'cancelled') {
      this.#status = 'cancelled';
      if (!this.#config.options.noCache) {
        await this.#config.cache.clear(this.#cacheKey);
      }
      this.#deferred.reject(new Error('Request cancelled'));
    }
  }
}
