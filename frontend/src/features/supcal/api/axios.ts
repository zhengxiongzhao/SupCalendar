import axios from 'axios'

function emptyToNull(data: unknown): unknown {
  if (data === null || data === undefined) return data
  if (typeof data === 'string') return data === '' ? null : data
  if (Array.isArray(data)) return data.map(emptyToNull)
  if (typeof data === 'object' && data.constructor === Object) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      out[k] = emptyToNull(v)
    }
    return out
  }
  return data
}

export const supcalApi = axios.create({
  baseURL: import.meta.env.VITE_SUPCAL_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

supcalApi.interceptors.request.use((config) => {
  if (config.data && typeof config.data === 'object') {
    config.data = emptyToNull(config.data)
  }
  return config
})

supcalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('SupCalendar API: Unauthorized')
    }
    return Promise.reject(error)
  }
)
