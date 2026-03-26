'use client'

import Link from 'next/link'
import type { CalendarRecord, SimpleRecord, PaymentRecord } from '@/types'
import { formatDate, daysUntil, getUrgencyClass } from '@/utils/formatDate'

interface UpcomingListProps {
  records: CalendarRecord[]
}

function getPeriodLabel(period: string) {
  const labels: Record<string, string> = {
    'natural-month': '自然月',
    'membership-month': '会员月',
    quarter: '季度',
    year: '年',
  }
  return labels[period] || period
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

function getRecordSubtitle(record: CalendarRecord) {
  if (record.type === 'payment') {
    return (record as PaymentRecord).category
  }
  return getPeriodLabel((record as SimpleRecord).period)
}

function getDisplayTime(record: CalendarRecord): string {
  if (record.next_occurrence) {
    return record.next_occurrence
  }
  return record.type === 'payment'
    ? (record as PaymentRecord).next_occurrence || (record as PaymentRecord).start_time
    : (record as SimpleRecord).time
}

export function UpcomingList({ records }: UpcomingListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">即将到来</h2>
          <p className="text-sm text-gray-500 mt-0.5">近期提醒事项</p>
        </div>
        <Link href="/records" className="text-sm text-blue-600 font-medium hover:text-blue-700">
          查看全部
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500">暂无即将到来的记录</p>
          <Link href="/create" className="mt-3 text-blue-600 font-medium hover:text-blue-700 block">
            添加提醒
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {records.map((record) => (
            <Link
              key={record.id}
              href={`/edit/${record.id}`}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer block"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${getRecordColor(record)}`}>
                {getRecordIcon(record)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{record.name}</p>
                <p className="text-sm text-gray-500">{getRecordSubtitle(record)}</p>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-900">{formatDate(getDisplayTime(record))}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyClass(
                    daysUntil(getDisplayTime(record))
                  )}`}
                >
                  {daysUntil(getDisplayTime(record))} 天后
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
