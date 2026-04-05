'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRecordsStore } from '@/stores/records'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SettingsRow, FormSectionHeader, InlineSegment } from '@/components/ui/settings-row'
import type { SimpleRecordCreate, PeriodType } from '@/types'

const periods: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'half-year', label: '半年' },
  { value: 'year', label: '年' },
]

const inlineInputCls = "bg-transparent border-0 text-right text-sm font-medium w-full max-w-[200px] outline-none placeholder:text-muted-foreground/50 focus:ring-0"

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
    >
      {error && (
        <div className="px-4 py-3 mb-2 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <SettingsRow label="提醒名称">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例如：会员续费、生日提醒"
            className={inlineInputCls}
          />
        </SettingsRow>

        <SettingsRow label="提醒时间">
          <input
            type="datetime-local"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className={inlineInputCls}
          />
        </SettingsRow>
      </div>

      <FormSectionHeader>周期设置</FormSectionHeader>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <SettingsRow label="重复周期">
          <InlineSegment
            options={periods.map((p) => ({ value: p.value, label: p.label }))}
            value={form.period}
            onChange={(v) => setForm({ ...form, period: v })}
          />
        </SettingsRow>
      </div>

      <FormSectionHeader>更多详情</FormSectionHeader>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <div className="flex items-start justify-between min-h-[48px] px-4 py-3 border-b border-border/40 last:border-b-0">
          <span className="text-sm text-foreground shrink-0 pt-0.5">备注</span>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="添加详细描述..."
            rows={2}
            className="border-0 bg-transparent text-right text-sm w-full max-w-[200px] resize-none p-0 focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
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
