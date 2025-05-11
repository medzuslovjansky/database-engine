import { z } from 'zod';

import { textSchema, dateSchema, nullableText } from '../base';
import type { EventName, EventPayloadMap } from '../events';

export const eventSchema = z.object({
  id: z.number().optional(), // AUTOINCREMENT
  aggregate_id: textSchema,
  seq: z.number(),
  type: z.custom<EventName>(),
  timestamp: dateSchema,
  actor: nullableText,
  payload: textSchema
});

export type Event = z.infer<typeof eventSchema>;

export type TypedEvent<K extends EventName = EventName> = {
  id?: number;
  aggregate_id: string;
  seq: number;
  type: K;
  timestamp: number;
  actor: string | null;
  payload: EventPayloadMap[K];
};
