import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { PaymentRecord, CalendarRecord } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const topPayments = ref<PaymentRecord[]>([])
  const upcomingSimples = ref<CalendarRecord[]>([])
  const summary = ref<{ income: number; expense: number; balance: number } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasPayments = computed(() => topPayments.value.length > 0)

  async function fetchTopPayments() {
    loading.value = true
    error.value = null
    try {
      topPayments.value = await api.get<PaymentRecord[]>('/api/v1/dashboard/top-payments')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch payments'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchUpcomingSimples() {
    loading.value = true
    error.value = null
    try {
      upcomingSimples.value = await api.get<CalendarRecord[]>('/api/v1/dashboard/upcoming-simples')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch upcoming records'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary() {
    loading.value = true
    error.value = null
    try {
      summary.value = await api.get<{ income: number; expense: number; balance: number }>('/api/v1/dashboard/summary')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch summary'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchAll() {
    await Promise.all([
      fetchTopPayments(),
      fetchUpcomingSimples(),
      fetchSummary(),
    ])
  }

  return {
    topPayments,
    upcomingSimples,
    summary,
    loading,
    error,
    hasPayments,
    fetchTopPayments,
    fetchUpcomingSimples,
    fetchSummary,
    fetchAll,
  }
})
