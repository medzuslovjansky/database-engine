import OpenAI from 'openai';
import { AIService, AICompletionRequest, AIRequestHandle, AIServiceCompleteOptions } from '../../types';
import { RPMThrottler } from '../RPMThrottler';
import { OpenAIServiceConfig } from './OpenAIServiceConfig';
import { OpenAICompleteOptions } from './OpenAICompleteOptions';
import { OpenAIRequestHandle } from './OpenAIRequestHandle';
import { OpenAICompositeRequestHandle } from './OpenAICompositeRequestHandle';

export class OpenAIService implements AIService {
  #client: OpenAI;
  #throttler: RPMThrottler;
  #defaultOptions: OpenAICompleteOptions;
  #config: OpenAIServiceConfig;

  constructor(config: OpenAIServiceConfig) {
    this.#config = config;
    this.#client = new OpenAI({ apiKey: config.apiKey });

    const rateLimit = {
      requestsPerMinute: 60,
      maxConcurrent: 5,
      ...config.rateLimit,
    };

    this.#throttler = new RPMThrottler(rateLimit.requestsPerMinute, rateLimit.maxConcurrent);

    // Set default options
    this.#defaultOptions = {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      ...config.defaults,
    };
  }

  async complete(
    requests: Iterable<AICompletionRequest>,
    options: AIServiceCompleteOptions = {}
  ): Promise<AIRequestHandle> {
    if (options.priority === 'relaxed') {
      return this.#batchComplete(requests, options);
    } else {
      return this.#immediateComplete(requests, options);
    }
  }

  async #batchComplete(
    _requests: Iterable<AICompletionRequest>,
    _options: AIServiceCompleteOptions = {}
  ): Promise<AIRequestHandle> {
    throw new Error('Relaxed (batch) processing not yet implemented');
  }

  async #immediateComplete(
    requests: Iterable<AICompletionRequest>,
    options: AIServiceCompleteOptions = {}
  ): Promise<AIRequestHandle> {
    const requestArray = Array.from(requests);
    if (requestArray.length === 0) {
      throw new Error('No requests provided');
    }

    const completeOptions: OpenAICompleteOptions = {
      ...this.#defaultOptions,
      ...options,
    };

    const handles = requestArray.map(request =>
      new OpenAIRequestHandle({
        client: this.#client,
        request,
        cache: this.#config.cache,
        throttler: this.#throttler,
        options: completeOptions
      })
    );

    return requestArray.length === 1
      ? handles[0]
      : new OpenAICompositeRequestHandle(handles);
  }
}
