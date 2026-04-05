'use client'

import { create } from 'zustand'
import { api } from '@/services/api'
import type { PaymentRecord, CalendarRecord } from '@/types'

interface DashboardState {
  topPayments: PaymentRecord[]
  upcomingSimples: CalendarRecord[]
  summary: { income: number; expense: number; balance: number } | null
  loading: boolean
  error: string | null
  hasPayments: boolean
  fetchTopPayments: () => Promise<void>
  fetchUpcomingSimples: () => Promise<void>
  fetchSummary: () => Promise<void>
  fetchAll: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  topPayments: [],
  upcomingSimples: [],
  summary: null,
  loading: false,
  error: null,
  hasPayments: false,

  fetchTopPayments: async () => {
    set({ loading: true, error: null })
    try {
      const topPayments = await api.get<PaymentRecord[]>('/api/v1/dashboard/top-payments')
      set({ topPayments, hasPayments: topPayments.length > 0 })
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to fetch payments'
      set({ error })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  fetchUpcomingSimples: async () => {
    set({ loading: true, error: null })
    try {
      const upcomingSimples = await api.get<CalendarRecord[]>(
        '/api/v1/dashboard/upcoming-simples'
      )
      set({ upcomingSimples })
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to fetch upcoming records'
      set({ error })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  fetchSummary: async () => {
    set({ loading: true, error: null })
    try {
      const summary = await api.get<{ income: number; expense: number; balance: number }>(
        '/api/v1/dashboard/summary'
      )
      set({ summary })
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to fetch summary'
      set({ error })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  fetchAll: async () => {
    await Promise.all([
      get().fetchTopPayments(),
      get().fetchUpcomingSimples(),
      get().fetchSummary(),
    ])
  },
}))
