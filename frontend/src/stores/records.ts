import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { Record, SimpleRecord, PaymentRecord, SimpleRecordCreate, PaymentRecordCreate } from '@/types'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<Record[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const payments = computed(() => 
    records.value.filter((r): r is PaymentRecord => r.type === 'payment')
  )

  const simpleRecords = computed(() =>
    records.value.filter((r): r is SimpleRecord => r.type === 'simple')
  )

  async function fetchRecords() {
    loading.value = true
    error.value = null
    try {
      records.value = await api.get<Record[]>('/api/v1/records')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch records'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createSimpleRecord(data: SimpleRecordCreate) {
    const record = await api.post<SimpleRecord>('/api/v1/records/simple', data)
    records.value.push(record)
    return record
  }

  async function createPaymentRecord(data: PaymentRecordCreate) {
    const record = await api.post<PaymentRecord>('/api/v1/records/payment', data)
    records.value.push(record)
    return record
  }

  async function deleteRecord(id: string) {
    await api.delete(`/api/v1/records/${id}`)
    records.value = records.value.filter(r => r.id !== id)
  }

  return {
    records,
    loading,
    error,
    payments,
    simpleRecords,
    fetchRecords,
    createSimpleRecord,
    createPaymentRecord,
    deleteRecord,
  }
})
