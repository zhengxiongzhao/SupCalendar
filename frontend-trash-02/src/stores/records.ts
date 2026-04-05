'use client'

import { create } from 'zustand'
import { api } from '@/services/api'
import type {
  CalendarRecord,
  SimpleRecord,
  PaymentRecord,
  SimpleRecordCreate,
  PaymentRecordCreate,
  SimpleRecordUpdate,
  PaymentRecordUpdate,
} from '@/types'

interface RecordsState {
  records: CalendarRecord[]
  loading: boolean
  error: string | null
  fetchRecords: () => Promise<void>
  createSimpleRecord: (data: SimpleRecordCreate) => Promise<SimpleRecord>
  createPaymentRecord: (data: PaymentRecordCreate) => Promise<PaymentRecord>
  deleteRecord: (id: string) => Promise<void>
  updateSimpleRecord: (id: string, data: SimpleRecordUpdate) => Promise<SimpleRecord>
  updatePaymentRecord: (id: string, data: PaymentRecordUpdate) => Promise<PaymentRecord>
  getRecordById: (id: string) => CalendarRecord | undefined
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],
  loading: false,
  error: null,

  fetchRecords: async () => {
    set({ loading: true, error: null })
    try {
      const records = await api.get<CalendarRecord[]>('/api/v1/records')
      set({ records })
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to fetch records'
      set({ error })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  createSimpleRecord: async (data) => {
    const record = await api.post<SimpleRecord>('/api/v1/records/simple', data)
    set((state) => ({ records: [...state.records, record] }))
    return record
  },

  createPaymentRecord: async (data) => {
    const record = await api.post<PaymentRecord>('/api/v1/records/payment', data)
    set((state) => ({ records: [...state.records, record] }))
    return record
  },

  deleteRecord: async (id) => {
    await api.delete(`/api/v1/records/${id}`)
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    }))
  },

  updateSimpleRecord: async (id, data) => {
    const record = await api.put<SimpleRecord>(`/api/v1/records/simple/${id}`, data)
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? record : r)),
    }))
    return record
  },

  updatePaymentRecord: async (id, data) => {
    const record = await api.put<PaymentRecord>(`/api/v1/records/payment/${id}`, data)
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? record : r)),
    }))
    return record
  },

  getRecordById: (id) => {
    return get().records.find((r) => r.id === id)
  },
}))
