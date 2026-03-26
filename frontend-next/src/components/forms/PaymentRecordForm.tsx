'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRecordsStore } from '@/stores/records'
import { supportApi } from '@/services/api'
import { ComboInput } from '@/components/common/ComboInput'
import { CURRENCY_OPTIONS } from '@/types'
import type { PaymentRecordCreate, Category, PaymentMethod, PeriodType } from '@/types'
import { calculateEndTime } from '@/utils/formatDate'

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
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">加载数据中...</p>
        </div>
      )}

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
            {!form.end_time && <span className="text-xs text-gray-400 ml-2">(可手动修改)</span>}
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

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={resetForm}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          重置
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
          {isSubmitting ? '创建中...' : '创建记录'}
        </button>
      </div>
    </form>
  )
}
