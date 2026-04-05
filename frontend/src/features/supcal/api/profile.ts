import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supcalApi } from './axios'
import type { ProfileStats, ExportData, ImportResult } from '../types'
import { toast } from 'sonner'

export function useProfileStats() {
  return useQuery({
    queryKey: ['supcal', 'profile', 'stats'],
    queryFn: async () => {
      const { data } = await supcalApi.get<ProfileStats>('/profile/stats')
      return data
    },
  })
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await supcalApi.get<ExportData>('/profile/export')
      return data
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `supcalendar-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('导出成功')
    },
    onError: () => toast.error('导出失败'),
  })
}

export function useImportData() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await supcalApi.post<ImportResult>('/profile/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['supcal'] })
      if (result.success) {
        toast.success(`成功导入 ${result.imported} / ${result.total} 条记录`)
      } else {
        toast.error(`导入失败：${result.errors.map((e) => e.reason).join(', ')}`)
      }
    },
    onError: () => toast.error('导入失败'),
  })
}
