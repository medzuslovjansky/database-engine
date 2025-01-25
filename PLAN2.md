# Interslavic Database Engine - Spelling & Translation Refinement

This plan outlines the implementation of a CLI tool for **detecting spelling errors** and **refining translations** in Interslavic synset XML files, using:
- Hunspell (for spelling validation)
- AI APIs (OpenAI/Anthropic for corrections and refinements)
- Zod (for AI response validation)

## High-Level Goals

1. **Process XML Synsets**
   Process synset XML files using the existing `@interslavic/database-engine-fs` package.

2. **Validate AI Responses**
   Use Zod schemas to ensure AI API responses are properly typed and validated.

3. **Detect Issues**
   - For verified translations (where `verified="false"` is not present): detect spelling errors via Hunspell
   - For unverified translations (marked with `verified="false"`): flag for refinement

4. **Prepare AI Requests**
   - Create prompts for spell checking suspicious words
   - Create prompts for refining unverified translations
   - Support multiple AI providers (OpenAI, Anthropic)

5. **Process with AI**
   Submit batches of prompts for cost-effective processing with:
   - File-based caching
   - Rate limiting
   - Error handling

6. **Apply Updates**
   Write corrections and refinements back to XML while preserving structure.

7. **Generate Reports**
   Create detailed logs of changes and potential issues.

## Implementation Details

### 1. AI Service Package (`packages/ai/`)

```typescript
// Core AI service interfaces
export interface AIService {
  complete(request: CompletionRequest): Promise<unknown>;
  createBatchProcessor<T = unknown>(): BatchProcessor<T>;
  clearCache(): Promise<void>;
}

// Batch processing for cost-effective API usage
export interface BatchProcessor<T = unknown> {
  enqueue(requests: CompletionRequest[]): void;
  onResult(callback: (result: { request: CompletionRequest; response: T }) => void): void;
  onError(callback: (error: { request: CompletionRequest; error: Error }) => void): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

// File-based caching
export interface AICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T): Promise<void>;
  clear(): Promise<void>;
}
```

### 2. Response Schemas

```typescript
import { z } from 'zod';

export const SpellCheckResponseSchema = z.object({
  corrections: z.string().optional(),
  confidence: z.number().min(0).max(1),
  explanation: z.string().optional()
});

export const TranslationRefinementResponseSchema = z.object({
  original: z.string(),
  refined: z.string(),
  confidence: z.number().min(0).max(1),
  notes: z.array(z.string()).optional(),
  verified: z.boolean()
});
```

### 3. Spelling Service

```typescript
export class HunspellService {
  static async for(language: string, options?: HunspellOptions): Promise<HunspellService>;

  async check(text: string): Promise<SpellCheckedText>;

  // Returns marked text with suggestions
  // Example: "text with {error|suggestion1|suggestion2}"
  toString(verbose?: boolean): string;
}
```

### 4. CLI Integration

```typescript
export type RefineArgv = {
  subcommand: 'refine';
  mode: 'spelling' | 'translations';
  lang?: string[];
  dryRun: boolean;
  only: boolean;
  _: string[];
};

// Handler implementation in synsets-cmd/refine.ts
export async function refine(argv: RefineArgv) {
  // Initialize services
  const { fileDatabase } = await compose({ offline: true });
  const aiService = argv.provider === 'anthropic'
    ? new AnthropicService(config)
    : new OpenAIService(config);

  // Process synsets
  await fileDatabase.multisynsets.forEach(async (synset) => {
    // Implementation details...
  });
}
```

## Dependencies

Add to `packages/ai/package.json`:
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.18.0",
    "@interslavic/database-engine-fs": "workspace:*",
    "nodehun": "^3.0.2",
    "openai": "^4.28.0",
    "zod": "^3.22.4"
  }
}
```

## Next Steps

1. **Core Functionality**
   - ✅ AI service implementations
   - ✅ Hunspell integration
   - ✅ Basic CLI structure
   - 🚧 Translation refinement workflow
   - ❌ Report generation

2. **Testing & Validation**
   - ✅ Hunspell service tests
   - 🚧 AI service tests
   - ❌ End-to-end workflow tests
   - ❌ Sample synset validation

3. **Documentation & Polish**
   - ❌ JSDoc comments
   - ❌ Usage documentation
   - ❌ AI prompt documentation
   - ❌ Change report format specification

## Notes

- Use structured AI prompts for consistent responses
- Implement caching and retry logic for API failures
  - ✅ File-based caching implemented
  - 🚧 Retry logic needed
  - ❌ Rate limiting needed
- Consider adding more language-specific prompts
- Add proper error reporting and statistics

## Appendix

Example of synset:

<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<multilingual-synset
  id="37842"
  xmlns="https://interslavic.fun/schemas/zonal-wordnet.xsd"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:steen="https://interslavic.fun/schemas/steenbergen.xsd"
>
  <synset lang="art-x-interslv">
    <lemma steen:id="37842" steen:pos="adj.">aminokyslinovy</lemma>
  </synset>
  <synset lang="en">
    <lemma>aminoacid</lemma>
  </synset>
  <synset lang="be">
    <lemma>амінакіслотны</lemma>
    <lemma>амінакіслявы</lemma>
  </synset>
  <synset lang="bg" verified="false">
    <lemma>аминокиселинен</lemma>
  </synset>
  <synset lang="cs">
    <lemma>aminokyselinový</lemma>
  </synset>
  <synset lang="hr" verified="false">
    <lemma>aminokiselinski</lemma>
  </synset>
  <synset lang="mk" verified="false">
    <lemma>аминокиселински</lemma>
    <lemma>амино-киселински</lemma>
  </synset>
  <synset lang="pl">
    <lemma>aminokwasowy</lemma>
  </synset>
  <synset lang="ru">
    <lemma>аминокислотный</lemma>
  </synset>
  <synset lang="sk">
    <lemma>aminokyselinový</lemma>
  </synset>
  <synset lang="sl" verified="false">
    <lemma>aminokislinski</lemma>
  </synset>
  <synset lang="sr">
    <lemma>аминокиселински</lemma>
  </synset>
  <synset lang="uk">
    <lemma>амінокислотний</lemma>
  </synset>
</multilingual-synset>
