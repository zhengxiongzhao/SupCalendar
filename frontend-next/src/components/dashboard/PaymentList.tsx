'use client'

import Link from 'next/link'
import type { PaymentRecord } from '@/types'
import { formatAmount, formatDateWithNext, daysUntil, getUrgencyClass } from '@/utils/formatDate'

interface PaymentListProps {
  records: PaymentRecord[]
}

export function PaymentList({ records }: PaymentListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">收付款 TOP 10</h2>
          <p className="text-sm text-gray-500 mt-0.5">按金额排序</p>
        </div>
        <Link href="/records?filter=payment" className="text-sm text-blue-600 font-medium hover:text-blue-700">
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
                d="M9 7h6m0 3.666V14m-6.118 4.25l.677 1.444a1 1 0 001.802 0l.678-1.444M12 21a9 9 0 110-18 9 9 0 010 18z"
              />
            </svg>
          </div>
          <p className="text-gray-500">暂无收付款记录</p>
          <Link href="/create" className="mt-3 text-blue-600 font-medium hover:text-blue-700 block">
            添加一条
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
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                  record.direction === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}
              >
                {record.direction === 'income' ? '↗' : '↘'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{record.name}</p>
                <p className="text-sm text-gray-500">{record.category}</p>
              </div>

              <div className="text-right">
                <p className={`font-bold ${record.direction === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {record.direction === 'income' ? '+' : '-'}
                  {formatAmount(record.amount, record.currency)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDateWithNext(record.next_occurrence || '无')}
                </p>
                {record.next_occurrence && (
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyClass(
                      daysUntil(record.next_occurrence)
                    )}`}
                  >
                    {daysUntil(record.next_occurrence)} 天后
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
