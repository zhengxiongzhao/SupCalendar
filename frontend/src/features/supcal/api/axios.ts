import axios from 'axios'

export const supcalApi = axios.create({
  baseURL: import.meta.env.VITE_SUPCAL_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
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
