import { useQuery } from '@tanstack/react-query'
import { supcalApi } from './axios'
import type { Category, PaymentMethod } from '../types'

export function useCategories() {
  return useQuery({
    queryKey: ['supcal', 'support', 'categories'],
    queryFn: async () => {
      const { data } = await supcalApi.get<Category[]>('/support/categories')
      return data
    },
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['supcal', 'support', 'payment-methods'],
    queryFn: async () => {
      const { data } = await supcalApi.get<PaymentMethod[]>('/support/payment-methods')
      return data
    },
  })
}
