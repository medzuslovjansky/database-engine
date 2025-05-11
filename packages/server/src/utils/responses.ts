/**
 * Helper functions for API responses
 */

/**
 * Creates a JSON response with proper headers
 * @param data The data to serialize as JSON
 * @param status HTTP status code
 * @returns Response object
 */
export const jsonResponse = (data: any, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * Creates an error response
 * @param message Error message
 * @param status HTTP status code
 * @returns Response object
 */
export const errorResponse = (message: string, status = 400): Response => {
  return jsonResponse({ error: { message } }, status);
};
