/**
 * Resilient API Client for Study Kit
 *
 * Guaranteed to handle serverless timeouts, edge HTML responses,
 * automatic retries on 502/504, and friendly error messages.
 */

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
  retryCount?: number;
}

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal safe fetch function
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { timeoutMs = 25000, retryCount = 1, headers, ...restOptions } = options;

  let attempts = 0;
  const maxAttempts = 1 + (retryCount || 0);

  while (attempts < maxAttempts) {
    attempts++;

    // Setup abort controller for timeout safety
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if we hit a transient 502/504 serverless error and can retry
      if ((response.status === 502 || response.status === 504) && attempts < maxAttempts) {
        console.warn(`[apiClient] Received ${response.status} from ${url}, retrying attempt ${attempts + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        continue;
      }

      // Read response body as raw text first to avoid parser explosions on HTML error pages
      const rawText = await response.text();

      let parsedData: any = null;
      let parseSuccess = false;

      if (rawText && rawText.trim().length > 0) {
        try {
          parsedData = JSON.parse(rawText);
          parseSuccess = true;
        } catch {
          parseSuccess = false;
        }
      }

      // If HTTP status is not ok (e.g. 4xx or 5xx)
      if (!response.ok) {
        let errorMessage = 'Server is busy, please retry in a few moments.';

        if (parseSuccess && parsedData && (parsedData.error || parsedData.message)) {
          errorMessage = parsedData.error || parsedData.message;
        } else if (response.status === 404) {
          errorMessage = 'The requested study service is currently unavailable. Please verify connection.';
        } else if (response.status === 429) {
          errorMessage = 'Study Kit is receiving high demand right now. Please wait a few seconds and retry.';
        } else if (response.status === 502 || response.status === 504) {
          errorMessage = 'Study service took longer than expected. Please try generating in smaller sections.';
        } else if (response.status >= 500) {
          errorMessage = 'AI processing server encountered an issue. Please try again.';
        }

        throw new ApiError(errorMessage, response.status, parsedData);
      }

      // If status is 200 OK but body is not JSON (e.g. Netlify returned index.html)
      if (!parseSuccess) {
        if (rawText.trim().startsWith('<!DOCTYPE') || rawText.includes('<html')) {
          throw new ApiError(
            'The study backend service is momentarily starting up or re-routing. Please retry shortly.',
            503
          );
        }
        throw new ApiError('Received an unexpected response format from server. Please retry.', 500);
      }

      return parsedData as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Handle aborted/timed-out requests
      if (err.name === 'AbortError') {
        if (attempts < maxAttempts) {
          console.warn(`[apiClient] Request to ${url} timed out, retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw new ApiError('Request timed out. Please try requesting a smaller question batch or shorter text.', 504);
      }

      // If it's already an ApiError and not eligible for retry, rethrow
      if (err instanceof ApiError) {
        if ((err.status === 502 || err.status === 504) && attempts < maxAttempts) {
          continue;
        }
        throw err;
      }

      // Network level failure (e.g. offline, connection refused)
      if (attempts < maxAttempts) {
        console.warn(`[apiClient] Network failure on ${url}, retrying...`, err);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      throw new ApiError(
        err.message && !err.message.includes('JSON')
          ? err.message
          : 'Network connection issue. Please check your internet connection and retry.',
        500
      );
    }
  }

  throw new ApiError('Server is busy, please retry in a moment.', 504);
}

export const apiClient = {
  get: <T = any>(url: string, options?: ApiClientOptions) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: ApiClientOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
