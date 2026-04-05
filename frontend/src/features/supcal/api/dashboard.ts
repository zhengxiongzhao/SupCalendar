import { useQuery } from '@tanstack/react-query'
import { supcalApi } from './axios'
import type { PaymentRecord, CalendarRecord, DashboardSummary } from '../types'

export function useTopPayments() {
  return useQuery({
    queryKey: ['supcal', 'dashboard', 'top-payments'],
    queryFn: async () => {
      const { data } = await supcalApi.get<PaymentRecord[]>('/dashboard/top-payments')
      return data
    },
  })
}

export function useUpcomingRecords() {
  return useQuery({
    queryKey: ['supcal', 'dashboard', 'upcoming'],
    queryFn: async () => {
      const { data } = await supcalApi.get<CalendarRecord[]>('/dashboard/upcoming-simples')
      return data
    },
  })
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['supcal', 'dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await supcalApi.get<DashboardSummary>('/dashboard/summary')
      return data
    },
  })
}
