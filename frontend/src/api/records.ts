import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  CalendarRecord,
  SimpleRecord,
  PaymentRecord,
  SimpleRecordCreate,
  PaymentRecordCreate,
} from '@/types'

// Query keys factory
export const recordKeys = {
  all: ['records'] as const,
  list: () => [...recordKeys.all, 'list'] as const,
  detail: (id: string) => [...recordKeys.all, 'detail', id] as const,
}

export function useRecords() {
  return useQuery({
    queryKey: recordKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<CalendarRecord[]>('/records')
      return data
    },
  })
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: recordKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<CalendarRecord>(`/records/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSimpleRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: SimpleRecordCreate) => {
      const { data } = await apiClient.post<SimpleRecord>('/records/simple', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
    },
  })
}

export function useCreatePaymentRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PaymentRecordCreate) => {
      const { data } = await apiClient.post<PaymentRecord>('/records/payment', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
    },
  })
}

export function useUpdateSimpleRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SimpleRecordCreate }) => {
      const { data: resp } = await apiClient.put<SimpleRecord>(`/records/simple/${id}`, data)
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
    },
  })
}

export function useUpdatePaymentRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PaymentRecordCreate }) => {
      const { data: resp } = await apiClient.put<PaymentRecord>(`/records/payment/${id}`, data)
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
    },
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/records/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
    },
  })
}
