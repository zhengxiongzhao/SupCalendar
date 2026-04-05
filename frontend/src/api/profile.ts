import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export const profileKeys = {
  all: ['profile'] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
}

export function useProfileStats() {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        total_records: number
        total_income: number
        total_expense: number
        this_month_records: number
      }>('/profile/stats')
      return data
    },
  })
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.get<Record<string, unknown>>('/profile/export')
      return data
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `supcalendar-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
  })
}
