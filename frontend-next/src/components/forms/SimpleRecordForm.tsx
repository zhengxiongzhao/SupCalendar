'use client'

import { useState } from 'react'
import { useRecordsStore } from '@/stores/records'
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">提醒名称</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例如：会员续费、生日提醒"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>

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
        <label className="block text-sm font-medium text-gray-700 mb-2">重复周期</label>
        <div className="grid grid-cols-2 gap-3">
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
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="添加详细描述..."
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
