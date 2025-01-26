import { AIRequestHandle } from '../../types';

export class OpenAICompositeRequestHandle implements AIRequestHandle {
  constructor(private handles: AIRequestHandle[]) {}

  async value(abortSignal?: AbortSignal): Promise<string> {
    if (abortSignal?.aborted) {
      await this.cancel();
      return Promise.reject(new Error('Request aborted'));
    }
    const results = await Promise.all(this.handles.map(h => h.value(abortSignal)));
    return JSON.stringify(results);
  }

  async cancel(): Promise<void> {
    await Promise.all(this.handles.map(h => h.cancel()));
  }
}
