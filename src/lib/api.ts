import axios, { type AxiosError } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? '/api/v1'

// When BASE_URL is a relative path (/api/v1), Vite proxies all requests same-origin.
// The XSRF-TOKEN cookie is then on localhost, readable by JS → CSRF works.
// When BASE_URL is a full URL (production), the frontend domain must be in the
// backend CORS / Sanctum stateful-domains list for cookies to work.
const IS_PROXIED = BASE_URL.startsWith('/')

// CSRF cookie is at /sanctum/csrf-cookie (proxied) or <origin>/sanctum/csrf-cookie (prod)
const CSRF_URL = IS_PROXIED
  ? '/sanctum/csrf-cookie'
  : BASE_URL.replace(/\/api\/v1\/?$/, '') + '/sanctum/csrf-cookie'

export const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
})

// ── CSRF (Sanctum SPA) ────────────────────────────────────────────────────────

let _csrfFetched = false

export async function ensureCsrf() {
  if (_csrfFetched) return
  await axios.get(CSRF_URL, { withCredentials: true })
  _csrfFetched = true
}

// Auto-retry once on 419 (expired CSRF token)
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    if (err.response?.status === 419 && !(err.config as any)._retried) {
      _csrfFetched = false
      await ensureCsrf()
      const retryConfig = { ...err.config, _retried: true } as any
      return api(retryConfig)
    }
    return Promise.reject(err)
  }
)

// ── Error normalisation ───────────────────────────────────────────────────────

export interface ApiError {
  code:            string
  message:         string
  details?:        unknown
  correlation_id?: string
}

export function extractApiError(err: unknown): ApiError {
  const ax   = err as AxiosError<{ message?: string; code?: string; errors?: Record<string, string[]>; correlation_id?: string }>
  const data = ax.response?.data
  return {
    code:           data?.code           ?? 'UNKNOWN',
    message:        data?.message        ?? (ax.message || 'Une erreur est survenue.'),
    details:        data?.errors,
    correlation_id: data?.correlation_id ?? (ax.response?.headers?.['x-correlation-id'] as string | undefined),
  }
}
