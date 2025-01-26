import { CacheService } from '../../types';
import { OpenAICompleteOptions } from './OpenAICompleteOptions';

export interface OpenAIServiceConfig {
  apiKey: string;
  cache: CacheService;
  defaults?: Partial<OpenAICompleteOptions>;
  rateLimit?: {
    requestsPerMinute: number;
    maxConcurrent?: number;
  };
  batchProcessing?: {
    pollIntervalMs: number;
    maxBatchSize: number;
  };
}
