import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CalendarRecord } from '@/types'

export const calendarKeys = {
  all: ['calendar'] as const,
  month: (year: number, month: number) => [...calendarKeys.all, 'month', year, month] as const,
}

export function useCalendarMonth(year: number, month: number) {
  return useQuery({
    queryKey: calendarKeys.month(year, month),
    queryFn: async () => {
      const { data } = await apiClient.get<CalendarRecord[]>(`/calendar/month/${year}/${month}`)
      return data
    },
  })
}

export function useSubscriptionUrls() {
  return useQuery({
    queryKey: [...calendarKeys.all, 'subscription-urls'] as const,
    queryFn: async () => {
      const { data } = await apiClient.get<{ url: string }>('/calendar/subscriptions/token')
      return data
    },
  })
}
