import { useRef, useState } from 'react'
import { Download, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useExportData, useImportData } from '../../api/profile'

export function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exportMutation = useExportData()
  const importMutation = useImportData()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleImport() {
    if (!selectedFile) return
    importMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      },
    })
  }

  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            导出数据
          </CardTitle>
          <CardDescription>
            将所有记录导出为 JSON 文件，可用于备份或迁移数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className='w-full sm:w-auto'
          >
            {exportMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Download className='mr-2 h-4 w-4' />
            )}
            导出所有记录
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            导入数据
          </CardTitle>
          <CardDescription>
            从 JSON 文件导入记录，支持之前导出的数据格式
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <input
              ref={fileInputRef}
              type='file'
              accept='.json'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setSelectedFile(file)
              }}
            />
            <Button
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              className='w-full sm:w-auto'
            >
              选择文件
            </Button>
            {selectedFile && (
              <p className='mt-2 text-sm text-muted-foreground'>
                已选择：{selectedFile.name}
              </p>
            )}
          </div>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importMutation.isPending}
            className='w-full sm:w-auto'
          >
            {importMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Upload className='mr-2 h-4 w-4' />
            )}
            导入数据
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
