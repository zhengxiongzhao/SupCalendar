import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { PaymentRecord, CalendarRecord } from '@/types'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  topPayments: () => [...dashboardKeys.all, 'top-payments'] as const,
  upcoming: () => [...dashboardKeys.all, 'upcoming'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
}

export function useTopPayments(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.topPayments(),
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentRecord[]>('/dashboard/top-payments', {
        params: { limit },
      })
      return data
    },
  })
}

export function useUpcomingSimples(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.upcoming(),
    queryFn: async () => {
      const { data } = await apiClient.get<CalendarRecord[]>('/dashboard/upcoming-simples', {
        params: { limit },
      })
      return data
    },
  })
}

export function useSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ income: number; expense: number; balance: number }>('/dashboard/summary')
      return data
    },
  })
}
