'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRecordsStore } from '@/stores/records'
import { supportApi } from '@/services/api'
import { ComboInput } from '@/components/common/ComboInput'
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
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (error && !isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/records" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">编辑记录</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 font-medium">{error}</p>
          <Link href="/records" className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-block">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/records" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">编辑记录</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-5"
          >
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">记录名称</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：房租、工资"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {recordType === 'payment' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, direction: 'income' })}
                      className={`px-4 py-3 rounded-xl border-2 text-center font-medium transition-all flex items-center justify-center gap-2 ${
                        form.direction === 'income'
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">↗</span>
                      收入
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, direction: 'expense' })}
                      className={`px-4 py-3 rounded-xl border-2 text-center font-medium transition-all flex items-center justify-center gap-2 ${
                        form.direction === 'expense'
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">↘</span>
                      支出
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">金额</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount || ''}
                      onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                    <ComboInput
                      value={form.category}
                      onChange={(value) => setForm({ ...form, category: value })}
                      options={categories.map((c) => c.name)}
                      placeholder="输入或选择分类"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">付款方式</label>
                    <ComboInput
                      value={form.payment_method}
                      onChange={(value) => setForm({ ...form, payment_method: value })}
                      options={paymentMethods.map((m) => m.name)}
                      placeholder="输入或选择付款方式"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                    <input
                      type="datetime-local"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结束时间
                      {!isEndTimeManuallySet && form.end_time && (
                        <span className="text-xs text-green-600 ml-2">(自动计算)</span>
                      )}
                    </label>
                    <input
                      type="datetime-local"
                      value={form.end_time}
                      onChange={(e) => {
                        setForm({ ...form, end_time: e.target.value })
                        setIsEndTimeManuallySet(true)
                      }}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all ${
                        !isEndTimeManuallySet && form.end_time ? 'bg-green-50 border-green-200' : 'border-gray-200'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">货币类型</label>
                  <div className="grid grid-cols-2 gap-3">
                    {CURRENCY_OPTIONS.map((currency) => (
                      <button
                        key={currency.value}
                        type="button"
                        onClick={() => setForm({ ...form, currency: currency.value })}
                        className={`px-4 py-3 rounded-xl border-2 text-center font-medium transition-all ${
                          form.currency === currency.value
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {currency.symbol} {currency.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="添加备注信息..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                  />
                </div>
              </>
            )}

            {recordType === 'simple' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">提醒时间</label>
                  <input
                    type="datetime-local"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="添加详细描述..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">重复周期</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {periods.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setForm({ ...form, period: period.value })}
                    className={`px-4 py-3 rounded-xl border-2 text-center font-medium transition-all ${
                      form.period === period.value
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/records"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                取消
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                删除
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isSubmitting ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
