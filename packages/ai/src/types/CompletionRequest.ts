import { z } from 'zod';

export interface CompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  responseSchema?: z.ZodType;
  options?: unknown;
}
