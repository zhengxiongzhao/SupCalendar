'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react'
import { useRecordsStore } from '@/stores/records'
import { supportApi } from '@/services/api'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CURRENCY_OPTIONS } from '@/types'
import type { PaymentRecordCreate, Category, PaymentMethod, PeriodType } from '@/types'
import { calculateEndTime } from '@/utils/formatDate'
import { cn } from '@/lib/utils'

const periods: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'half-year', label: '半年' },
  { value: 'year', label: '年' },
]

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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="space-y-5"
    >
      {isLoadingData && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">加载数据中...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
      )}

      <div>
        <Label htmlFor="record-name">记录名称</Label>
        <Input
          id="record-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例如：房租、工资"
        />
      </div>

      <div>
        <Label>类型</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={form.direction === 'income' ? 'default' : 'outline'}
            onClick={() => setForm({ ...form, direction: 'income' })}
            className={cn(
              "px-4 py-3 rounded-xl border-2 text-center font-medium transition-all flex items-center justify-center gap-2",
              form.direction === 'income' 
                ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                : 'border-border hover:border-border/80'
            )}
          >
            <ArrowUpRight className="text-xl" />
            收入
          </Button>
          <Button
            type="button"
            variant={form.direction === 'expense' ? 'destructive' : 'outline'}
            onClick={() => setForm({ ...form, direction: 'expense' })}
            className={cn(
              "px-4 py-3 rounded-xl border-2 text-center font-medium transition-all flex items-center justify-center gap-2",
              form.direction === 'expense'
                ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                : 'border-border hover:border-border/80'
            )}
          >
            <ArrowDownRight className="text-xl" />
            支出
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="amount">金额</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={form.amount || ''}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>

      <div>
        <Label>货币类型</Label>
        <div className="grid grid-cols-2 gap-3">
          {CURRENCY_OPTIONS.map((currency) => (
            <Button
              key={currency.value}
              type="button"
              variant={form.currency === currency.value ? 'default' : 'outline'}
              onClick={() => setForm({ ...form, currency: currency.value })}
              className={cn(
                "px-4 py-3 rounded-xl border-2 text-center font-medium transition-all",
                form.currency === currency.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border'
              )}
            >
              {currency.symbol} {currency.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">分类</Label>
          <Combobox
            value={form.category}
            onValueChange={(value) => setForm({ ...form, category: value })}
            items={categories.map((c) => c.name)}
            placeholder="输入或选择分类"
          />
        </div>

        <div>
          <Label htmlFor="payment-method">付款方式</Label>
          <Combobox
            value={form.payment_method}
            onValueChange={(value) => setForm({ ...form, payment_method: value })}
            items={paymentMethods.map((m) => m.name)}
            placeholder="输入或选择付款方式"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time">开始时间</Label>
          <Input
            id="start-time"
            type="datetime-local"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end-time">
            结束时间
            {!isEndTimeManuallySet && form.end_time && (
              <span className="text-xs text-green-600 dark:text-green-400 ml-2">(自动计算)</span>
            )}
            {!form.end_time && <span className="text-xs text-muted-foreground ml-2">(可手动修改)</span>}
          </Label>
          <Input
            id="end-time"
            type="datetime-local"
            value={form.end_time}
            onChange={(e) => {
              setForm({ ...form, end_time: e.target.value })
              setIsEndTimeManuallySet(true)
            }}
            className={!isEndTimeManuallySet && form.end_time ? 'bg-green-50 dark:bg-green-950' : undefined}
          />
        </div>
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
        <Label htmlFor="notes">备注（可选）</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="添加备注信息..."
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
