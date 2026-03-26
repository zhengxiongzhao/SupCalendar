'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRecordsStore } from '@/stores/records'
import type { PaymentRecord, CalendarRecord } from '@/types'
import { formatAmount, formatDateWithNext, daysUntil, getUrgencyClass } from '@/utils/formatDate'

export default function RecordsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { records, fetchRecords, deleteRecord, loading } = useRecordsStore()
  const [filter, setFilter] = useState<'all' | 'payment' | 'simple'>('all')

  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam && ['payment', 'simple'].includes(filterParam)) {
      setFilter(filterParam as 'payment' | 'simple')
    }
    fetchRecords()
  }, [fetchRecords, searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filter !== 'all') {
      params.set('filter', filter)
    }
    const query = params.toString()
    router.replace(query ? `?${query}` : '/records', { scroll: false })
  }, [filter, router])

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records
    return records.filter((r): r is CalendarRecord => r.type === filter)
  }, [records, filter])

  function getRecordIcon(record: CalendarRecord) {
    if (record.type === 'payment') {
      return (record as PaymentRecord).direction === 'income' ? '↗' : '↘'
    }
    return '📅'
  }

  function getRecordColor(record: CalendarRecord) {
    if (record.type === 'payment') {
      const r = record as PaymentRecord
      return r.direction === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }
    return 'bg-blue-100 text-blue-700'
  }

  function getRecordAmount(record: CalendarRecord) {
    if (record.type === 'payment') {
      const r = record as PaymentRecord
      return (r.direction === 'income' ? '+' : '-') + formatAmount(r.amount, r.currency || 'CNY')
    }
    return '提醒'
  }

  function getRecordSubtitle(record: CalendarRecord) {
    if (record.type === 'payment') {
      return (record as PaymentRecord).category
    }
    return '简单提醒'
  }

  async function handleDelete(id: string) {
    if (confirm('确定要删除这条记录吗？')) {
      await deleteRecord(id)
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">所有记录</h1>
        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          新建记录
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'payment', 'simple'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? '全部' : f === 'payment' ? '收付款' : '简单提醒'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      )}

      {!loading && filteredRecords.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">暂无记录</p>
          <p className="text-gray-400 text-sm mt-1">点击下方按钮创建第一条记录</p>
          <Link
            href="/create"
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            新建记录
          </Link>
        </div>
      )}

      {!loading && filteredRecords.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              <Link href={`/edit/${record.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${getRecordColor(record)}`}
                >
                  {getRecordIcon(record)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{record.name}</p>
                  <p className="text-sm text-gray-500">{getRecordSubtitle(record)}</p>
                </div>

                <div className="text-right">
                  <p
                    className={`font-bold ${
                      record.type === 'payment' && (record as PaymentRecord).direction === 'income'
                        ? 'text-green-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {getRecordAmount(record)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateWithNext(record.next_occurrence || record.created_at)}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyClass(
                      daysUntil(record.next_occurrence || record.created_at)
                    )}`}
                  >
                    {daysUntil(record.next_occurrence || record.created_at)} 天后
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/edit/${record.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
