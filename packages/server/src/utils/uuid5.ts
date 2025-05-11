import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';

/**
 * The namespace UUID for 'slovosbor'
 * This custom namespace is deterministically generated from the string 'slovosbor'
 * using the DNS namespace as its parent namespace
 */
export const SLOVOSBOR_NAMESPACE = uuidv5('slovosbor', '00000000-0000-0000-0000-000000000000');

/**
 * Generates a deterministic UUID v5 from a string value using our application namespace
 * @param value The string value to derive the UUID from
 * @returns A UUID v5 string
 */
export function generateUuid5(value: string): string {
  return uuidv5(value, SLOVOSBOR_NAMESPACE);
}

/**
 * Generates a deterministic UUID v5 from multiple string values
 * Combines the values with a separator before generating the UUID
 * @param values The string values to derive the UUID from
 * @returns A UUID v5 string
 */
export function generateUuid5FromMultiple(values: string[]): string {
  const combinedValue = values.join('|');
  return generateUuid5(combinedValue);
}

/**
 * Generates a random UUID v4
 * @returns A UUID v4 string
 */
export function generateUuid4(): string {
  return uuidv4();
}
