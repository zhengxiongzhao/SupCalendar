const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  },

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  },

  // 上传文件
  upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
    })
  },
}

// 个人中心 API
export const profileApi = {
  // 获取统计数据
  getStats() {
    return api.get<{ total_records: number; total_income: number; total_expense: number; this_month_records: number }>('/v1/profile/stats')
  },

  // 导出所有记录
  exportData() {
    return api.get('/v1/profile/export')
  },

  // 导入记录
  importData(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/v1/profile/import', formData)
  },
}
