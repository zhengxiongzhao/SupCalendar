import { useState, useRef } from 'react'
import { Download, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useExportData } from '@/api/profile'
import { apiClient } from '@/lib/api-client'

export function DataManagement() {
  const exportMutation = useExportData()
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('数据导出成功')
      },
      onError: () => {
        toast.error('导出失败')
      },
    })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('请选择 JSON 文件')
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await apiClient.post('/profile/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('数据导入成功')
    } catch {
      toast.error('导入失败')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据管理</CardTitle>
        <CardDescription>导出或导入你的记录数据</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <Button
            variant='outline'
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className='mr-2 size-4 animate-spin' />
            ) : (
              <Download className='mr-2 size-4' />
            )}
            导出数据 (JSON)
          </Button>
          <div>
            <input
              ref={fileInputRef}
              type='file'
              accept='.json'
              onChange={handleImport}
              className='hidden'
              id='import-file'
            />
            <Button
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : (
                <Upload className='mr-2 size-4' />
              )}
              导入数据 (JSON)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
