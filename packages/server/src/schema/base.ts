import { z } from 'zod';

// Common schema types
export const idSchema = z.string();
export const textSchema = z.string();
export const dateSchema = z.number(); // Using integer timestamps
export const jsonSchema = z.string().transform((str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
});

// Nullable schemas
export const nullableText = z.string().nullable();
export const nullableId = z.string().nullable();
export const nullableNumber = z.number().nullable();
