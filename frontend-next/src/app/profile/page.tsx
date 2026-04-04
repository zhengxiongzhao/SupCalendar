'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Download, Loader2, FolderOpen } from 'lucide-react'
import { profileApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Stats {
  total_records: number
  total_income: number
  total_expense: number
  this_month_records: number
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [importFile, setImportFile] = useState<File | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadStats() {
    try {
      setLoading(true)
      setError('')
      const data = await profileApi.getStats()
      setStats(data as Stats)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || '加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  async function exportData() {
    try {
      setLoading(true)
      setError('')
      const data = await profileApi.exportData()

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `supcalendar-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || '导出失败')
    } finally {
      setLoading(false)
    }
  }

  async function importData() {
    if (!importFile) {
      setError('请先选择文件')
      return
    }

    try {
      setLoading(true)
      setError('')
      const result = await profileApi.importData(importFile) as {
        success: boolean
        imported: number
        total: number
        simple_records: number
        payment_records: number
        errors: Array<{ index: number; reason: string }>
      }

      if (result.success && result.imported > 0) {
        const summary = [
          `成功导入 ${result.imported} / ${result.total} 条记录`,
          result.simple_records > 0 ? `  - 简单提醒: ${result.simple_records} 条` : '',
          result.payment_records > 0 ? `  - 收付款: ${result.payment_records} 条` : '',
          result.errors.length > 0 ? `\n⚠ ${result.errors.length} 条记录导入失败` : '',
        ].filter(Boolean).join('\n')

        alert(summary)
        window.location.reload()
      } else {
        const errorDetails = result.errors?.map(e => `#${e.index}: ${e.reason}`).join('\n') || '未知错误'
        setError(`导入失败 (${result.imported}/${result.total})\n${errorDetails}`)
      }
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || '导入失败')
    } finally {
      setLoading(false)
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setImportFile(event.target.files[0])
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">总记录数</span>
            </div>
            <p className="text-3xl font-bold">{stats?.total_records || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-muted-foreground">总收入</span>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">¥{stats?.total_income || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-muted-foreground">总支出</span>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">¥{stats?.total_expense || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-muted-foreground">本月记录</span>
            </div>
            <p className="text-3xl font-bold">{stats?.this_month_records || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              导出数据
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">导出所有记录为 JSON 文件，可用于备份或数据迁移。</p>
            <Button onClick={exportData} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              导出所有记录
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              导入数据
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">从 JSON 文件导入记录。注意：导入会合并数据，不会覆盖现有记录。</p>

            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="importFile"
              />
              <Label htmlFor="importFile" className="cursor-pointer flex flex-col items-center gap-2">
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
                <span className="text-foreground">{importFile?.name || '点击选择文件'}</span>
                <span className="text-sm text-muted-foreground">支持 JSON 格式</span>
              </Label>
            </div>

            <Button onClick={importData} disabled={loading || !importFile} variant="outline" className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              导入数据
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
