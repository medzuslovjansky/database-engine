import OpenAI from 'openai';
import { AIService, BatchProcessor, CompletionRequest } from '../types';
import { AICache } from '../types/AICache';

interface OpenAIServiceConfig {
  apiKey: string;
  cache: AICache;
}

interface OpenAIServiceOptions {
  model?: string;
  temperature?: number;
}

interface OpenAIBatchProcessorConfig {
  client: OpenAI;
  cache: AICache;
  defaultOptions: Required<OpenAIServiceOptions>;
}

class OpenAIBatchProcessor<T = unknown> implements BatchProcessor<T> {

  private queue: CompletionRequest[] = [];
  private isProcessing = false;
  private resultCallbacks: ((result: { request: CompletionRequest; response: T }) => void)[] = [];
  private errorCallbacks: ((error: { request: CompletionRequest; error: Error }) => void)[] = [];

  private client: OpenAI;
  private cache: AICache;
  private defaultOptions: Required<OpenAIServiceOptions>;

  constructor(config: OpenAIBatchProcessorConfig) {
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
      const options = request.options as OpenAIServiceOptions | undefined;

      return {
        model: options?.model ?? this.defaultOptions.model,
        temperature: options?.temperature ?? this.defaultOptions.temperature,
        messages: [
          { role: 'system' as const, content: request.systemPrompt },
          { role: 'user' as const, content: request.userPrompt }
        ]
      } satisfies OpenAI.Chat.ChatCompletionCreateParams;
    });
  }

  private async processBatchResults(responses: OpenAI.Chat.ChatCompletion[]) {
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const request = this.queue[i];

      try {
        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('No response content from OpenAI');
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
        requests.map(req => this.client.chat.completions.create(req))
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

export class OpenAIService implements AIService {
  private client: OpenAI;
  private defaultOptions: Required<OpenAIServiceOptions>;

  constructor(
    private config: OpenAIServiceConfig,
    options: OpenAIServiceOptions = {}
  ) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.defaultOptions = {
      model: options.model ?? 'gpt-4-turbo-preview',
      temperature: options.temperature ?? 0.3
    };
  }

  async complete(request: CompletionRequest): Promise<unknown> {
    const cacheKey = `complete:${request.systemPrompt}:${request.userPrompt}`;
    const cached = await this.config.cache.get(cacheKey);
    if (cached) return cached;

    const options = request.options as OpenAIServiceOptions | undefined;
    const completion = await this.client.chat.completions.create({
      model: options?.model ?? this.defaultOptions.model,
      temperature: options?.temperature ?? this.defaultOptions.temperature,
      messages: [
        { role: 'system' as const, content: request.systemPrompt },
        { role: 'user' as const, content: request.userPrompt }
      ]
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

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
    return new OpenAIBatchProcessor<T>({
      client: this.client,
      cache: this.config.cache,
      defaultOptions: this.defaultOptions
    });
  }

  async clearCache(): Promise<void> {
    await this.config.cache.clear();
  }
}
