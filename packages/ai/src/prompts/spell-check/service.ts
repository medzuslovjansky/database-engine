import { Language } from '@interslavic/database-engine-core';
import { AIService } from '../../types';
import { SpellCheckRequest, SpellCheckResponse, SpellCheckResponseSchema } from './schema';
import * as _userPrompts from './user-prompts';
import * as _systemPrompts from './system-prompts';

const userPrompts = _userPrompts as Record<Language, (request: SpellCheckRequest) => string>;
const systemPrompts = _systemPrompts as Record<Language, string>;

export class SpellCheckService {
  constructor(private aiService: AIService) {}

  private getSystemPrompt(language: Language): string {
    const prompt = systemPrompts[language];
    if (!prompt) {
      throw new Error(`No system prompt found for language: ${language}`);
    }
    return prompt;
  }

  private getUserPrompt(request: SpellCheckRequest): string {
    const promptGenerator = userPrompts[request.language];
    if (!promptGenerator) {
      throw new Error(`No user prompt generator found for language: ${request.language}`);
    }
    return promptGenerator(request);
  }

  async checkSpelling(request: SpellCheckRequest): Promise<SpellCheckResponse> {
    const userPrompt = this.getUserPrompt(request);
    const systemPrompt = this.getSystemPrompt(request.language);

    return this.aiService.complete({
      systemPrompt,
      userPrompt,
      responseSchema: SpellCheckResponseSchema
    }) as Promise<SpellCheckResponse>;
  }

  async checkSpellingBatch(requests: SpellCheckRequest[]): Promise<void> {
    const processor = this.aiService.createBatchProcessor<SpellCheckResponse>();
    const prompts = requests.map(request => ({
      systemPrompt: this.getSystemPrompt(request.language),
      userPrompt: this.getUserPrompt(request),
      responseSchema: SpellCheckResponseSchema
    }));

    processor.onResult(({ request, response }) => {
      // Here you can emit events, update UI, or handle results as they come
      console.log('Processed:', { request, response });
    });

    processor.onError(({ request, error }) => {
      console.error('Failed to process:', { request, error });
    });

    processor.enqueue(prompts);
    await processor.start();
  }
}

