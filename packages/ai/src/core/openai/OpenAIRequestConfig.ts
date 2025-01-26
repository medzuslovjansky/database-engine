import { OpenAI } from "openai";
import { AICompletionRequest, CacheService } from "../../types";
import { RPMThrottler } from "../RPMThrottler";
import { OpenAICompleteOptions } from "./OpenAICompleteOptions";

export interface OpenAIRequestConfig {
  client: OpenAI;
  request: AICompletionRequest;
  cache: CacheService;
  throttler: RPMThrottler;
  options: OpenAICompleteOptions;
}
