/**
 * Pagination utilities
 */

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
}

/**
 * Pagination result metadata
 */
export interface PaginationMeta {
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  /** Data for the current page */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Calculate pagination values
 * @param page Current page (1-based)
 * @param pageSize Items per page
 * @param totalItems Total number of items
 * @returns Calculated offset, limit and pagination metadata
 */
export function calculatePagination(
  page: number = 1,
  pageSize: number = 20,
  totalItems: number = 0
): { offset: number; limit: number; meta: PaginationMeta } {
  // Ensure valid pagination parameters
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(100, pageSize));

  // Calculate total pages
  const totalPages = totalItems > 0
    ? Math.ceil(totalItems / validPageSize)
    : 0;

  // Calculate offset and limit for SQL queries
  const offset = (validPage - 1) * validPageSize;
  const limit = validPageSize;

  // Build pagination metadata
  const meta: PaginationMeta = {
    currentPage: validPage,
    pageSize: validPageSize,
    totalItems,
    totalPages,
    hasNext: validPage < totalPages,
    hasPrevious: validPage > 1
  };

  return { offset, limit, meta };
}
