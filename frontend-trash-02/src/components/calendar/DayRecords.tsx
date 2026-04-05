'use client'

import Link from 'next/link'
import { Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
    return r.direction === 'income' 
      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' 
      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400'
  }
  return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{formatDate(date)}</CardTitle>
        <p className="text-sm text-muted-foreground">{records.length} 条记录</p>
      </CardHeader>

      {records.length === 0 ? (
        <CardContent className="pt-0">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">这一天没有记录</p>
            <Link href="/create">
              <Button variant="link" className="mt-3">
                <Plus className="w-4 h-4 mr-1" />
                添加记录
              </Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-0">
          <div className="divide-y divide-border -mx-6 px-6 max-h-96 overflow-y-auto">
            {sortedRecords(records).map((record) => (
              <div
                key={record.id}
                className="py-3 flex items-center gap-3 hover:bg-accent transition-colors -mx-6 px-6"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0",
                    getRecordColor(record)
                  )}
                >
                  {getRecordIcon(record)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{record.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {record.type === 'simple'
                      ? formatTime((record as SimpleRecord).time)
                      : formatTime((record as PaymentRecord).start_time)}
                  </p>
                </div>

                <span
                  className={cn(
                    "font-bold",
                    record.type === 'payment' && (record as PaymentRecord).direction === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-foreground'
                  )}
                >
                  {getRecordAmount(record)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
