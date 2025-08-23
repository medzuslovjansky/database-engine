import type * as errors from './errors';

// Union of all error classes
export type InterslavicError =
  // Auth errors
  | errors.AuthenticationError
  | errors.AuthorizationError
  | errors.InvalidTokenError
  | errors.ProviderNotLinkedError
  // User errors
  | errors.UserNotFoundError
  | errors.InvalidUserIdError
  | errors.LoadUserRolesError
  // Validation errors
  | errors.ValidationError
  // Eventstore errors
  | errors.AggregateApplyError
  | errors.AggregateNotFoundError
  | errors.AggregateRegistrationNotFoundError
  | errors.DuplicateAggregateRegistrationError
  | errors.DuplicateProjectionRegistrationError
  | errors.EmptyAggregateTypeError
  | errors.EmptyIdError
  | errors.InvalidEventRevisionError
  | errors.InvalidSnapshotThresholdError
  | errors.InvalidStreamIdFormatError
  | errors.NoProjectionsFoundError
  | errors.ProjectionFlushError
  | errors.ProjectionNotFoundError
  | errors.ProjectionProcessingError
  // Server errors
  | errors.SlovosborError;

// Extract the code literal types
export type InterslavicErrorCode = InterslavicError['code'];
