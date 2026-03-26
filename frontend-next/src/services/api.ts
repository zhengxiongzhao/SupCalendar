const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const isFormData = options.body instanceof FormData

  const response = await fetch(url, {
    headers: isFormData
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      ...options,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' })
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' })
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},
    })
  },
}

export const profileApi = {
  getStats() {
    return api.get<{
      total_records: number
      total_income: number
      total_expense: number
      this_month_records: number
    }>('/api/v1/profile/stats')
  },

  exportData() {
    return api.get('/api/v1/profile/export')
  },

  importData(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/v1/profile/import', formData)
  },
}

export const supportApi = {
  getCategories() {
    return api.get<Array<{ id: string; name: string; type: string; color?: string }>>(
      '/api/v1/support/categories'
    )
  },

  getPaymentMethods() {
    return api.get<Array<{ id: string; name: string }>>(
      '/api/v1/support/payment-methods'
    )
  },
}
