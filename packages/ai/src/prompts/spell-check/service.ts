import { Language } from '@interslavic/database-engine-core';
import { AIService, AICompletionRequest } from '../../types';
import { SpellCheckRequest, SpellCheckResponse, SpellCheckResponseSchema } from './schema';
import * as _userPrompts from './user-prompts';
import * as _systemPrompts from './system-prompts';

const userPrompts = _userPrompts as Record<Language, (request: SpellCheckRequest) => string>;
const systemPrompts = _systemPrompts as Record<Language, string>;

export class SpellCheckService {
  constructor(private aiService: AIService) {}

  #getSystemPrompt(language: Language): string {
    const prompt = systemPrompts[language];
    if (!prompt) {
      throw new Error(`No system prompt found for language: ${language}`);
    }
    return prompt;
  }

  #getUserPrompt(request: SpellCheckRequest): string {
    const promptGenerator = userPrompts[request.language];
    if (!promptGenerator) {
      throw new Error(`No user prompt generator found for language: ${request.language}`);
    }
    return promptGenerator(request);
  }

  async checkSpelling(request: SpellCheckRequest[]): Promise<SpellCheckResponse[]> {
    const handles = await this.aiService.complete(request.map(req => this.#toCompletionRequest(req)));
    const results = await Promise.all(handles.map(handle => handle.value()));
    const jsons = results.map(result => JSON.parse(result));
    return this.#validateResults(jsons);
  }

  #toCompletionRequest(request: SpellCheckRequest): AICompletionRequest {
    return {
      messages: [
        { role: 'system', content: this.#getSystemPrompt(request.language) },
        { role: 'user', content: this.#getUserPrompt(request) }
      ],
      responseSchema: SpellCheckResponseSchema
    };
  }

  #validateResults(results: unknown[]): SpellCheckResponse[] {
    return results.map(result => SpellCheckResponseSchema.parse(result));
  }
}

