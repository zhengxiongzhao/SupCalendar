'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRecordsStore } from '@/stores/records'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SimpleRecordCreate, PeriodType } from '@/types'

const periods: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'half-year', label: '半年' },
  { value: 'year', label: '年' },
]

export function SimpleRecordForm({ onSuccess }: { onSuccess: () => void }) {
  const { createSimpleRecord } = useRecordsStore()

  const [form, setForm] = useState<SimpleRecordCreate>({
    name: '',
    time: new Date().toISOString().slice(0, 16),
    period: 'month',
    description: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('请输入名称')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await createSimpleRecord({
        ...form,
        description: form.description || undefined,
      })
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setForm({
      name: '',
      time: new Date().toISOString().slice(0, 16),
      period: 'month',
      description: '',
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="space-y-5"
    >
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
      )}

      <div>
        <Label htmlFor="simple-name">提醒名称</Label>
        <Input
          id="simple-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例如：会员续费、生日提醒"
        />
      </div>

      <div>
        <Label htmlFor="simple-time">提醒时间</Label>
        <Input
          id="simple-time"
          type="datetime-local"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
      </div>

      <div>
        <Label>重复周期</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {periods.map((period) => (
            <Button
              key={period.value}
              type="button"
              variant={form.period === period.value ? 'default' : 'outline'}
              onClick={() => setForm({ ...form, period: period.value })}
              className={cn(
                "px-4 py-3 rounded-xl border-2 text-center font-medium transition-all",
                form.period === period.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border'
              )}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="simple-description">备注（可选）</Label>
        <Textarea
          id="simple-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="添加详细描述..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={resetForm}>
          重置
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? '创建中...' : '创建记录'}
        </Button>
      </div>
    </form>
  )
}
