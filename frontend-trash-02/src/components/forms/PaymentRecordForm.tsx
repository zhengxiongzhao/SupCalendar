'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react'
import { useRecordsStore } from '@/stores/records'
import { supportApi } from '@/services/api'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SettingsRow, FormSectionHeader, InlineSegment } from '@/components/ui/settings-row'
import { CURRENCY_OPTIONS } from '@/types'
import type { PaymentRecordCreate, Category, PaymentMethod, PeriodType, Direction } from '@/types'
import { calculateEndTime } from '@/utils/formatDate'

const periods: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'half-year', label: '半年' },
  { value: 'year', label: '年' },
]

const directionOptions = [
  { value: 'income' as Direction, label: '收入', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
  { value: 'expense' as Direction, label: '支出', icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
]

const inlineInputCls = "bg-transparent border-0 text-right text-sm font-medium w-full max-w-[180px] outline-none placeholder:text-muted-foreground/50 focus:ring-0"

export function PaymentRecordForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const { createPaymentRecord } = useRecordsStore()

  const [form, setForm] = useState<PaymentRecordCreate>({
    name: '',
    description: '',
    direction: 'expense',
    category: '',
    amount: 0,
    payment_method: '',
    period: 'month',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    notes: '',
    currency: 'CNY',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isEndTimeManuallySet, setIsEndTimeManuallySet] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, methods] = await Promise.all([
          supportApi.getCategories(),
          supportApi.getPaymentMethods(),
        ])
        setCategories(cats as Category[])
        setPaymentMethods(methods as PaymentMethod[])
      } catch (e) {
        console.error('Failed to load data:', e)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!isEndTimeManuallySet) {
      setForm((f) => ({
        ...f,
        end_time: calculateEndTime(f.start_time, f.period),
      }))
    }
  }, [form.start_time, form.period, isEndTimeManuallySet])

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('请输入名称')
      return
    }
    if (form.amount < 0) {
      setError('请输入有效金额')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await createPaymentRecord({
        ...form,
        description: form.description || undefined,
        end_time: form.end_time || undefined,
        notes: form.notes || undefined,
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
      description: '',
      direction: 'expense',
      category: '',
      amount: 0,
      payment_method: '',
      period: 'month',
      start_time: new Date().toISOString().slice(0, 16),
      end_time: '',
      notes: '',
      currency: 'CNY',
    })
    setIsEndTimeManuallySet(false)
    setForm((f) => ({
      ...f,
      end_time: calculateEndTime(f.start_time, f.period),
    }))
  }

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">加载数据中...</p>
      </div>
    )
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
        <SettingsRow label="名称">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例如：房租、工资"
            className={inlineInputCls}
          />
        </SettingsRow>

        <SettingsRow label="流向">
          <InlineSegment
            options={directionOptions}
            value={form.direction}
            onChange={(v) => setForm({ ...form, direction: v })}
          />
        </SettingsRow>

        <SettingsRow label="金额">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">¥</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className={inlineInputCls}
            />
          </div>
        </SettingsRow>

        <SettingsRow label="货币">
          <InlineSegment
            options={CURRENCY_OPTIONS.map((c) => ({
              value: c.value,
              label: `${c.symbol} ${c.label}`,
            }))}
            value={form.currency}
            onChange={(v) => setForm({ ...form, currency: v })}
          />
        </SettingsRow>

        <SettingsRow label="分类" showChevron>
          <Combobox
            value={form.category}
            onValueChange={(value) => setForm({ ...form, category: value })}
            items={categories.map((c) => c.name)}
            placeholder="选择分类"
          />
        </SettingsRow>

        <SettingsRow label="付款方式" showChevron>
          <Combobox
            value={form.payment_method}
            onValueChange={(value) => setForm({ ...form, payment_method: value })}
            items={paymentMethods.map((m) => m.name)}
            placeholder="选择付款方式"
          />
        </SettingsRow>
      </div>

      <FormSectionHeader>时间设置</FormSectionHeader>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <SettingsRow label="开始时间">
          <input
            type="datetime-local"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            className={inlineInputCls}
          />
        </SettingsRow>

        <SettingsRow label="结束时间">
          <div className="flex items-center gap-2">
            {!isEndTimeManuallySet && form.end_time && (
              <span className="text-[10px] text-green-600 dark:text-green-400 shrink-0">自动</span>
            )}
            <input
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => {
                setForm({ ...form, end_time: e.target.value })
                setIsEndTimeManuallySet(true)
              }}
              className={inlineInputCls}
            />
          </div>
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
        <div className="flex items-start justify-between min-h-[48px] px-4 py-3 border-b border-border/40">
          <span className="text-sm text-foreground shrink-0 pt-0.5">备注</span>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="添加备注信息..."
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
