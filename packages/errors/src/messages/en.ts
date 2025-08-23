import type * as errors from '../errors';
import type { InterslavicError } from '../types';

/**
 * Error message mappings for English
 * Each error code maps to a parameterized function
 */
const ERROR_MESSAGES: Record<InterslavicError['code'], (details?: any) => string> = {
  // Authentication errors
  'AUTHENTICATION_ERROR': () => 'Authentication required',
  'AUTHORIZATION_ERROR': () => 'Insufficient permissions',
  'INVALID_TOKEN': () => 'Invalid or expired token',
  'PROVIDER_NOT_LINKED': () => 'Provider not linked to any user',

  // User errors
  'USER_NOT_FOUND': (details: errors.UserNotFoundErrorDetails) => `User not found: ${details.userId}`,
  'INVALID_USER_ID': (details: errors.InvalidUserIdErrorDetails) => `Invalid user ID: ${details.userId}`,
  'LOAD_USER_ROLES_ERROR': (details: errors.LoadUserRolesErrorDetails) => `Failed to load user roles: ${details.error}`,

  // Validation errors
  'VALIDATION_ERROR': (details: errors.ValidationErrorDetails) => `Validation failed: ${details.details}`,

  // Eventstore errors
  'AGGREGATE_APPLY_ERROR': (details: errors.AggregateApplyErrorDetails) =>
    `Failed to apply event ${details.eventId} to aggregate ${details.streamId}`,
  'AGGREGATE_NOT_FOUND': (details: errors.AggregateNotFoundErrorDetails) => `Aggregate not found: ${details.streamId}`,
  'AGGREGATE_REGISTRATION_NOT_FOUND': (details: errors.AggregateRegistrationNotFoundErrorDetails) =>
    `Aggregate registration not found: ${details.aggregateType}`,
  'DUPLICATE_AGGREGATE_REGISTRATION': (details: errors.DuplicateAggregateRegistrationErrorDetails) =>
    `Duplicate aggregate registration: ${details.aggregateType}`,
  'DUPLICATE_PROJECTION_REGISTRATION': (details: errors.DuplicateProjectionRegistrationErrorDetails) =>
    `Duplicate projection registration: ${details.projectionName}`,
  'EMPTY_AGGREGATE_TYPE': () => 'Aggregate type cannot be empty',
  'EMPTY_ID': () => 'ID cannot be empty',
  'INVALID_EVENT_REVISION': (details: errors.InvalidEventRevisionErrorDetails) =>
    `Invalid event revision: expected ${details.expected}, got ${details.actual}`,
  'INVALID_SNAPSHOT_THRESHOLD': (details: errors.InvalidSnapshotThresholdErrorDetails) =>
    `Invalid snapshot threshold: ${details.threshold}`,
  'INVALID_STREAM_ID_FORMAT': (details: errors.InvalidStreamIdFormatErrorDetails) =>
    `Invalid stream ID format: ${details.streamId}`,
  'NO_PROJECTIONS_FOUND': () => 'No projections found',
  'PROJECTION_FLUSH_ERROR': (details: errors.ProjectionFlushErrorDetails) =>
    `Projection flush error: ${details.projectionName}`,
  'PROJECTION_NOT_FOUND': (details: errors.ProjectionNotFoundErrorDetails) =>
    `Projection not found: ${details.projectionName}`,
  'PROJECTION_PROCESSING_ERROR': (details: errors.ProjectionProcessingErrorDetails) =>
    `Projection processing error: ${details.projectionName} failed to process event ${details.eventId}`,

  // Server errors
  'SLOVOSBOR_ERROR': (details: errors.SlovosborErrorDetails) => `Slovosbor error: ${JSON.stringify(details)}`,
} as const;

const UNHANDLED_ERROR_MESSAGE = ({ code }: any) => `Unhandled error: ${code}`;

/**
 * Get localized error message for an error code with details
 */
export function getErrorMessage(error: InterslavicError): string {
  const messageFn = ERROR_MESSAGES[error.code] || UNHANDLED_ERROR_MESSAGE;
  return messageFn(error.details);
}
