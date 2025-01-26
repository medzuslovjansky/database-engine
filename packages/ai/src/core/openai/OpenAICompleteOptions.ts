import { AIServiceCompleteOptions } from "../../types";

export interface OpenAICompleteOptions extends AIServiceCompleteOptions {
  model: string;
  temperature: number;
  maxTokens?: number;
}
