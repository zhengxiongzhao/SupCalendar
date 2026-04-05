import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Category, PaymentMethod } from '@/types'

export const supportKeys = {
  all: ['support'] as const,
  categories: () => [...supportKeys.all, 'categories'] as const,
  paymentMethods: () => [...supportKeys.all, 'payment-methods'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: supportKeys.categories(),
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>('/support/categories')
      return data
    },
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: supportKeys.paymentMethods(),
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentMethod[]>('/support/payment-methods')
      return data
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; type: string; color?: string }) => {
      const { data } = await apiClient.post<Category>('/support/categories', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.categories() })
    },
  })
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await apiClient.post<PaymentMethod>('/support/payment-methods', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.paymentMethods() })
    },
  })
}
