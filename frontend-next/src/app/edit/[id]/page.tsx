'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle } from 'lucide-react'
import { useRecordsStore } from '@/stores/records'
import { supportApi } from '@/services/api'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CURRENCY_OPTIONS } from '@/types'
import { cn } from '@/lib/utils'
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
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (error && !isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/records">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">编辑记录</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-medium">{error}</p>
            <Link href="/records">
              <Button variant="outline" className="mt-4">
                返回列表
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/records">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">编辑记录</h1>
      </div>

      <Card>
        <CardContent className="p-6">
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
              <Label htmlFor="name">记录名称</Label>
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：房租、工资"
              />
            </div>

            {recordType === 'payment' && (
              <>
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
                          : 'border-border'
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
                          : 'border-border'
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
              </>
            )}

            {recordType === 'simple' && (
              <>
                <div>
                  <Label htmlFor="time">提醒时间</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">备注（可选）</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="添加详细描述..."
                    rows={3}
                  />
                </div>
              </>
            )}

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

            <div className="flex gap-3 pt-2">
              <Link href="/records" className="flex-1">
                <Button variant="outline" className="w-full">
                  取消
                </Button>
              </Link>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                删除
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
