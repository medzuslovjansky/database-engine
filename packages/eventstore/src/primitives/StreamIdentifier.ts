import { EmptyIdError, EmptyAggregateTypeError, InvalidStreamIdFormatError } from "../errors";

/**
 * Immutable stream ID that encapsulates the aggregate type and instance ID
 * Prevents string manipulation errors and enforces consistent stream naming
 */
export class StreamIdentifier {
  /**
   * The aggregate type prefix (e.g., "user" or "account")
   */
  public readonly prefix: string;

  /**
   * The unique instance ID (e.g., "123" or "abc-def")
   */
  public readonly id: string;

  /**
   * Create a new StreamIdentifier
   *
   * @param prefix - The aggregate type
   * @param id - The unique instance ID
   */
  constructor(prefix: string, id: string) {
    if (!prefix) throw new EmptyAggregateTypeError();
    if (!id) throw new EmptyIdError();

    this.prefix = prefix;
    this.id = id;
  }

  /**
   * Parse a string representation of a stream ID
   *
   * @param streamId - String in the format "prefix/id"
   * @returns A new StreamIdentifier instance
   */
  public static fromString(streamId: string): StreamIdentifier {
    const parts = streamId.split('/');
    if (parts.length !== 2) throw new InvalidStreamIdFormatError(streamId);
    return new StreamIdentifier(parts[0], parts[1]);
  }

  /**
   * Get the full string representation of the stream ID
   *
   * @returns String in the format "prefix/id"
   */
  public toString(): string {
    return `${this.prefix}/${this.id}`;
  }

  /**
   * Check if this StreamIdentifier equals another
   */
  public equals(other: StreamIdentifier): boolean {
    return this.prefix === other.prefix && this.id === other.id;
  }
}
