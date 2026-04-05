import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supcalApi } from './axios'
import type {
  CalendarRecord,
  SimpleRecord,
  PaymentRecord,
  SimpleRecordFormValues,
  PaymentRecordFormValues,
} from '../types'

const RECORDS_KEY = ['supcal', 'records']
const RECORD_KEY = (id: string) => ['supcal', 'records', id]

export function useRecords() {
  return useQuery({
    queryKey: RECORDS_KEY,
    queryFn: async () => {
      const { data } = await supcalApi.get<CalendarRecord[]>('/records')
      return data
    },
  })
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: RECORD_KEY(id),
    queryFn: async () => {
      const { data } = await supcalApi.get<CalendarRecord>(`/records/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSimpleRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: SimpleRecordFormValues) => {
      const { data } = await supcalApi.post<SimpleRecord>('/records/simple', values)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  })
}

export function useCreatePaymentRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: PaymentRecordFormValues) => {
      const { data } = await supcalApi.post<PaymentRecord>('/records/payment', values)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  })
}

export function useUpdateSimpleRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: SimpleRecordFormValues }) => {
      const { data } = await supcalApi.put<SimpleRecord>(`/records/simple/${id}`, values)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  })
}

export function useUpdatePaymentRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: PaymentRecordFormValues }) => {
      const { data } = await supcalApi.put<PaymentRecord>(`/records/payment/${id}`, values)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  })
}

export function useDeleteRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supcalApi.delete(`/records/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  })
}
