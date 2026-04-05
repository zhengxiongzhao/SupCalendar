'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Loader2, DollarSign, Bell, Sparkles } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useRecordsStore } from '@/stores/records'
import { supportApi } from '@/services/api'
import { Combobox } from '@/components/ui/combobox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SettingsRow, FormSectionHeader, InlineSegment } from '@/components/ui/settings-row'
import { cn } from '@/lib/utils'
import { CURRENCY_OPTIONS } from '@/types'
import type {
  Category,
  PaymentMethod,
  PeriodType,
  Direction,
  SimpleRecord,
  PaymentRecord,
  SimpleRecordUpdate,
  PaymentRecordUpdate,
} from '@/types'
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

const inlineInputCls = "bg-transparent border-0 text-right text-sm font-medium w-full max-w-[200px] outline-none placeholder:text-muted-foreground/50 focus:ring-0"

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const { fetchRecords, getRecordById, updateSimpleRecord, updatePaymentRecord, deleteRecord } =
    useRecordsStore()

  const recordId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recordType, setRecordType] = useState<'simple' | 'payment'>('payment')

  const [form, setForm] = useState({
    name: '',
    description: '',
    direction: 'expense' as Direction,
    category: '',
    amount: 0,
    payment_method: '',
    period: 'month' as PeriodType,
    time: new Date().toISOString().slice(0, 16),
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    notes: '',
    currency: 'CNY',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
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

        await fetchRecords()
        const record = getRecordById(recordId)

        if (!record) {
          setError('记录不存在')
          setIsLoading(false)
          return
        }

        setRecordType(record.type)

        if (record.type === 'simple') {
          const simpleRecord = record as SimpleRecord
          setForm({
            name: simpleRecord.name,
            description: simpleRecord.description || '',
            direction: 'expense',
            category: '',
            amount: 0,
            payment_method: '',
            period: simpleRecord.period,
            time: simpleRecord.time.slice(0, 16),
            start_time: new Date().toISOString().slice(0, 16),
            end_time: '',
            notes: '',
            currency: 'CNY',
          })
        } else {
          const paymentRecord = record as PaymentRecord
          setForm({
            name: paymentRecord.name,
            description: paymentRecord.description || '',
            direction: paymentRecord.direction,
            category: paymentRecord.category,
            amount: paymentRecord.amount,
            payment_method: paymentRecord.payment_method,
            period: paymentRecord.period,
            time: new Date().toISOString().slice(0, 16),
            start_time: paymentRecord.start_time.slice(0, 16),
            end_time: paymentRecord.end_time ? paymentRecord.end_time.slice(0, 16) : '',
            notes: paymentRecord.notes || '',
            currency: paymentRecord.currency || 'CNY',
          })
        }
      } catch (e) {
        console.error('Failed to load data:', e)
        setError('加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [recordId, fetchRecords, getRecordById])

  useEffect(() => {
    if (!isEndTimeManuallySet && recordType === 'payment') {
      setForm((f) => ({
        ...f,
        end_time: calculateEndTime(f.start_time, f.period),
      }))
    }
  }, [form.start_time, form.period, isEndTimeManuallySet, recordType])

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('请输入名称')
      return
    }
    if (recordType === 'payment' && form.amount < 0) {
      setError('请输入有效金额')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      if (recordType === 'simple') {
        const data: SimpleRecordUpdate = {
          name: form.name,
          time: form.time,
          period: form.period,
          description: form.description || undefined,
        }
        await updateSimpleRecord(recordId, data)
      } else {
        const data: PaymentRecordUpdate = {
          name: form.name,
          description: form.description || undefined,
          direction: form.direction,
          category: form.category,
          amount: form.amount,
          payment_method: form.payment_method,
          period: form.period,
          start_time: form.start_time,
          end_time: form.end_time || undefined,
          notes: form.notes || undefined,
          currency: form.currency,
        }
        await updatePaymentRecord(recordId, data)
      }
      router.push('/records')
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('确定要删除这条记录吗？此操作无法撤销。')) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await deleteRecord(recordId)
      router.push('/records')
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between px-0 py-3 mb-4">
          <Link href="/records">
            <Button variant="ghost" size="sm">取消</Button>
          </Link>
          <h1 className="text-lg font-semibold">编辑记录</h1>
          <div className="w-12" />
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (error && !isSubmitting && !form.name) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/records">
            <Button variant="ghost" size="sm">取消</Button>
          </Link>
          <h1 className="text-lg font-semibold">编辑记录</h1>
          <div className="w-12" />
        </div>
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/records">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto animate-in">
      <div className="flex items-center justify-between mb-4">
        <Link href="/records">
          <Button variant="ghost" size="sm">取消</Button>
        </Link>
        <h1 className="text-lg font-semibold">编辑记录</h1>
        <Button variant="ghost" size="sm" onClick={() => handleSubmit()} disabled={isSubmitting}>
          完成
        </Button>
      </div>

      <div className="inline-flex items-center rounded-xl bg-muted/60 p-1 gap-0.5 w-full mb-4">
        {[
          { key: 'simple' as const, label: '简单', icon: <Bell className="w-3.5 h-3.5" /> },
          { key: 'payment' as const, label: '收付款', icon: <DollarSign className="w-3.5 h-3.5" /> },
          { key: 'custom' as const, label: '自定义', icon: <Sparkles className="w-3.5 h-3.5" /> },
        ].map((tab) => {
          const isActive = recordType === tab.key
          const isDisabled = !isActive
          return (
            <div
              key={tab.key}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              {tab.icon}
              {tab.label}
            </div>
          )
        })}
      </div>

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
              placeholder="输入名称..."
              className={inlineInputCls}
            />
          </SettingsRow>
        </div>

        {recordType === 'payment' && (
          <>
            <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden mt-3">
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
              <div className="flex items-start justify-between min-h-[48px] px-4 py-3">
                <span className="text-sm text-foreground shrink-0 pt-0.5">备注</span>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="添加备注..."
                  rows={2}
                  className="border-0 bg-transparent text-right text-sm w-full max-w-[200px] resize-none p-0 focus-visible:ring-0"
                />
              </div>
            </div>
          </>
        )}

        {recordType === 'simple' && (
          <>
            <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden mt-3">
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
              <div className="flex items-start justify-between min-h-[48px] px-4 py-3">
                <span className="text-sm text-foreground shrink-0 pt-0.5">备注</span>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="添加笔记..."
                  rows={2}
                  className="border-0 bg-transparent text-right text-sm w-full max-w-[200px] resize-none p-0 focus-visible:ring-0"
                />
              </div>
            </div>
          </>
        )}

        <div className="mt-8 pb-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full bg-red-50 dark:bg-red-950/50 text-red-500 rounded-xl py-3 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/70 transition-colors"
          >
            删除记录
          </button>
        </div>
      </form>
    </div>
  )
}
