import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supcalApi } from './axios'
import type { Category, PaymentMethod } from '../types'
import { toast } from 'sonner'

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

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: result } = await supcalApi.post<Category>('/support/categories', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supcal', 'support', 'categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      const { data: result } = await supcalApi.put<Category>(`/support/categories/${data.id}`, {
        name: data.name,
      })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supcal', 'support', 'categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supcalApi.delete(`/support/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supcal', 'support', 'categories'] })
      toast.success('分类已删除')
    },
    onError: () => {
      toast.error('删除分类失败')
    },
  })
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: result } = await supcalApi.post<PaymentMethod>('/support/payment-methods', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supcal', 'support', 'payment-methods'] })
    },
  })
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      const { data: result } = await supcalApi.put<PaymentMethod>(
        `/support/payment-methods/${data.id}`,
        { name: data.name }
      )
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supcal', 'support', 'payment-methods'] })
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supcalApi.delete(`/support/payment-methods/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supcal', 'support', 'payment-methods'] })
      toast.success('付款方式已删除')
    },
    onError: () => {
      toast.error('删除付款方式失败')
    },
  })
}

export function useAutoCreateCategory() {
  return useMutation({
    mutationFn: async (data: { name: string; user_id?: string }) => {
      const { data: result } = await supcalApi.post<Category>('/support/categories/auto-create', data)
      return result
    },
  })
}

export function useAutoCreatePaymentMethod() {
  return useMutation({
    mutationFn: async (data: { name: string; user_id?: string }) => {
      const { data: result } = await supcalApi.post<PaymentMethod>('/support/payment-methods/auto-create', data)
      return result
    },
  })
}
