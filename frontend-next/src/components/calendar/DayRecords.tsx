'use client'

import Link from 'next/link'
import type { CalendarRecord, SimpleRecord, PaymentRecord } from '@/types'
import { formatAmount, formatTime } from '@/utils/formatDate'

interface DayRecordsProps {
  date: Date
  records: CalendarRecord[]
}

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

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
  return 'bg-blue-100 text-blue-600'
}

function getRecordAmount(record: CalendarRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return (r.direction === 'income' ? '+' : '-') + formatAmount(r.amount, r.currency || 'CNY')
  }
  return '提醒'
}

function sortedRecords(records: CalendarRecord[]) {
  return [...records].sort((a, b) => {
    const dateA = new Date(
      a.type === 'simple' ? (a as SimpleRecord).time : (a as PaymentRecord).start_time
    )
    const dateB = new Date(
      b.type === 'simple' ? (b as SimpleRecord).time : (b as PaymentRecord).start_time
    )
    return dateA.getTime() - dateB.getTime()
  })
}

export function DayRecords({ date, records }: DayRecordsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{formatDate(date)}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{records.length} 条记录</p>
      </div>

      {records.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500">这一天没有记录</p>
          <Link href="/create" className="mt-3 text-blue-600 font-medium hover:text-blue-700 block">
            添加记录
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {sortedRecords(records).map((record) => (
            <div
              key={record.id}
              className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${getRecordColor(record)}`}
              >
                {getRecordIcon(record)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{record.name}</p>
                <p className="text-sm text-gray-500">
                  {record.type === 'simple'
                    ? formatTime((record as SimpleRecord).time)
                    : formatTime((record as PaymentRecord).start_time)}
                </p>
              </div>

              <span
                className={`font-bold ${
                  record.type === 'payment' && (record as PaymentRecord).direction === 'income'
                    ? 'text-green-600'
                    : 'text-gray-900'
                }`}
              >
                {getRecordAmount(record)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
