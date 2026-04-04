'use client'

import Link from 'next/link'
import { Clock, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
    return (record as PaymentRecord).direction === 'income' ? <ArrowUpRight /> : <ArrowDownRight />
  }
  return <Clock />
}

function getRecordColor(record: CalendarRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' 
      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
      : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
  }
  return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
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
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">即将到来</CardTitle>
          <p className="text-sm text-muted-foreground">近期提醒事项</p>
        </div>
        <Link href="/records">
          <Button variant="link" size="sm">
            查看全部
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      {records.length === 0 ? (
        <CardContent className="pt-0">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">暂无即将到来的记录</p>
            <Link href="/create">
              <Button variant="link" className="mt-3">
                添加提醒
              </Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-0">
          <div className="divide-y divide-border -mx-6 px-6">
            {records.map((record) => (
              <Link
                key={record.id}
                href={`/edit/${record.id}`}
                className="py-3 flex items-center gap-4 hover:bg-accent transition-colors cursor-pointer -mx-6 px-6 block"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0",
                  getRecordColor(record)
                )}>
                  {getRecordIcon(record)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{record.name}</p>
                  <p className="text-sm text-muted-foreground">{getRecordSubtitle(record)}</p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{formatDate(getDisplayTime(record))}</p>
                  <Badge
                    variant="outline"
                    className={cn("mt-1", getUrgencyClass(daysUntil(getDisplayTime(record))))}
                  >
                    {daysUntil(getDisplayTime(record))} 天后
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
