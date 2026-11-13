import axios from 'axios'

const MAX_ATTEMPTS = 3

export type RequestContext = Record<string, string | number>

/**
 * Runs an external API call, retrying network errors, 429 and 5xx with a warning per failure,
 * then throws an error carrying the last status/body. Other 4xx (bad key, bad input) fail at once.
 * `context` is logged and included in the error, so it must never contain API keys.
 */
export async function withRetry<T>(operation: string, context: RequestContext, call: () => Promise<T>): Promise<T> {
  let lastErrorDetail = ''
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await call()
    } catch (err) {
      lastErrorDetail = describeRequestError(err)
      console.warn('external request failed', { operation, attempt, maxAttempts: MAX_ATTEMPTS, ...context, error: lastErrorDetail })
      if (!isRetryable(err)) break
    }
  }
  throw new Error(`${operation} failed: ${lastErrorDetail} context=${JSON.stringify(context)}`)
}

function isRetryable(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false
  const status = err.response?.status
  return status === undefined || status === 429 || status >= 500
}

/** Summarizes an HTTP error without the request config, which contains the API key. */
function describeRequestError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return `status=${err.response?.status ?? 'none'} body=${JSON.stringify(err.response?.data ?? null)} message=${err.message}`
  }
  return err instanceof Error ? err.message : String(err)
}
