import Anthropic from '@anthropic-ai/sdk';
import { AIService, BatchProcessor, CompletionRequest } from '../types';
import { AICache } from '../types/AICache';

interface AnthropicServiceConfig {
  apiKey: string;
  cache: AICache;
}

interface AnthropicServiceOptions {
  model?: string;
  temperature?: number;
}

interface AnthropicBatchProcessorConfig {
  client: Anthropic;
  cache: AICache;
  defaultOptions: Required<AnthropicServiceOptions>;
}

class AnthropicBatchProcessor<T = unknown> implements BatchProcessor<T> {
  private queue: CompletionRequest[] = [];
  private isProcessing = false;
  private resultCallbacks: ((result: { request: CompletionRequest; response: T }) => void)[] = [];
  private errorCallbacks: ((error: { request: CompletionRequest; error: Error }) => void)[] = [];

  private client: Anthropic;
  private cache: AICache;
  private defaultOptions: Required<AnthropicServiceOptions>;

  constructor(config: AnthropicBatchProcessorConfig) {
    this.client = config.client;
    this.cache = config.cache;
    this.defaultOptions = config.defaultOptions;
  }

  enqueue(requests: CompletionRequest[]): void {
    this.queue.push(...requests);
  }

  onResult(callback: (result: { request: CompletionRequest; response: T }) => void): void {
    this.resultCallbacks.push(callback);
  }

  onError(callback: (error: { request: CompletionRequest; error: Error }) => void): void {
    this.errorCallbacks.push(callback);
  }

  private notifyResult(request: CompletionRequest, response: T): void {
    this.resultCallbacks.forEach(cb => cb({ request, response }));
  }

  private notifyError(request: CompletionRequest, error: Error): void {
    this.errorCallbacks.forEach(cb => cb({ request, error }));
  }

  private async createBatchRequest() {
    return this.queue.map(request => {
      const options = request.options as AnthropicServiceOptions | undefined;

      return {
        model: options?.model ?? this.defaultOptions.model,
        temperature: options?.temperature ?? this.defaultOptions.temperature,
        max_tokens: 4096,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.userPrompt }]
      } satisfies Anthropic.Messages.MessageCreateParams;
    });
  }

  private async processBatchResults(responses: Anthropic.Message[]) {
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const request = this.queue[i];

      try {
        const content = response.content[0].text;
        if (!content) {
          throw new Error('No response content from Anthropic');
        }

        let result: T;
        if (request.responseSchema) {
          const parsed = JSON.parse(content);
          result = request.responseSchema.parse(parsed) as T;
        } else {
          result = content as T;
        }

        const cacheKey = `complete:${request.systemPrompt}:${request.userPrompt}`;
        await this.cache.set(cacheKey, result);
        this.notifyResult(request, result);
      } catch (error) {
        this.notifyError(request, error as Error);
      }
    }
  }

  async start(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      const requests = await this.createBatchRequest();
      const responses = await Promise.all(
        requests.map(req => this.client.messages.create(req))
      );
      await this.processBatchResults(responses);
    } catch (error) {
      this.queue.forEach(request => this.notifyError(request, error as Error));
    } finally {
      this.isProcessing = false;
      this.queue = [];
    }
  }

  async stop(): Promise<void> {
    this.isProcessing = false;
  }
}

export class AnthropicService implements AIService {
  private client: Anthropic;
  private defaultOptions: Required<AnthropicServiceOptions>;

  constructor(
    private config: AnthropicServiceConfig,
    options: AnthropicServiceOptions = {}
  ) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.defaultOptions = {
      model: options.model ?? 'claude-3-opus-20240229',
      temperature: options.temperature ?? 0.3
    };
  }

  async complete(request: CompletionRequest): Promise<unknown> {
    const cacheKey = `complete:${request.systemPrompt}:${request.userPrompt}`;
    const cached = await this.config.cache.get(cacheKey);
    if (cached) return cached;

    const options = request.options as AnthropicServiceOptions | undefined;
    const message = await this.client.messages.create({
      model: options?.model ?? this.defaultOptions.model,
      temperature: options?.temperature ?? this.defaultOptions.temperature,
      max_tokens: 4096,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.userPrompt }]
    });

    const response = message.content[0].text;
    if (!response) throw new Error('No response from Anthropic');

    let result: unknown;
    if (request.responseSchema) {
      try {
        result = JSON.parse(response);
        result = request.responseSchema.parse(result);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Failed to parse response: ${error.message}`);
        }
        throw new Error('Failed to parse response: Unknown error');
      }
    } else {
      result = response;
    }

    await this.config.cache.set(cacheKey, result);
    return result;
  }

  createBatchProcessor<T = unknown>(): BatchProcessor<T> {
    return new AnthropicBatchProcessor<T>({
      client: this.client,
      cache: this.config.cache,
      defaultOptions: this.defaultOptions
    });
  }

  async clearCache(): Promise<void> {
    await this.config.cache.clear();
  }
}
