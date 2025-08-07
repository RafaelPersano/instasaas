/**
 * Custom error for API rate limiting (429 errors).
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
