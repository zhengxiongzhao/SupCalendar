import { Link } from '@tanstack/react-router'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CalendarRecord, SimpleRecord, PaymentRecord } from '@/types'
import { PERIOD_LABELS } from '@/types'
import { formatAmount, daysUntil, getUrgencyClass, getUrgencyLabel, formatDateWithNext } from '@/lib/format-date'

interface UpcomingRecordsProps {
  records: CalendarRecord[]
}

function getRecordIcon(record: CalendarRecord) {
  if (record.type === 'payment') {
    return (record as PaymentRecord).direction === 'income' ? TrendingUp : TrendingDown
  }
  return Calendar
}

function getRecordColorClass(record: CalendarRecord): string {
  if (record.type === 'payment') {
    return (record as PaymentRecord).direction === 'income'
      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
      : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
  }
  return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
}

function getRecordSubtitle(record: CalendarRecord): string {
  if (record.type === 'payment') {
    return (record as PaymentRecord).category || '未分类'
  }
  return PERIOD_LABELS[(record as SimpleRecord).period]
}

function getRecordAmount(record: CalendarRecord): string | null {
  if (record.type === 'payment') {
    const p = record as PaymentRecord
    return `${p.direction === 'income' ? '+' : '-'}${formatAmount(p.amount, p.currency)}`
  }
  return null
}

export function UpcomingRecords({ records }: UpcomingRecordsProps) {
  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>即将到来</CardTitle>
          <CardDescription>按时间排序的近期记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <p className='text-sm text-muted-foreground'>暂无即将到来的记录</p>
            <Link to='/create'>
              <Button variant='outline' size='sm' className='mt-3'>
                添加提醒
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>即将到来</CardTitle>
        <CardDescription>按时间排序的近期记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {records.map((record) => {
            const days = record.next_occurrence ? daysUntil(record.next_occurrence) : 999
            const Icon = getRecordIcon(record)
            const amount = getRecordAmount(record)
            return (
              <Link
                key={record.id}
                to='/edit/$id'
                params={{ id: record.id }}
                className='flex items-center justify-between rounded-lg p-3 hover:bg-accent transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <div className={`flex size-8 items-center justify-center rounded-full ${getRecordColorClass(record)}`}>
                    <Icon className='size-4' />
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{record.name}</p>
                    <p className='text-xs text-muted-foreground'>{getRecordSubtitle(record)}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-right'>
                    {amount && (
                      <p className='text-sm font-medium'>{amount}</p>
                    )}
                    {record.next_occurrence && (
                      <p className='text-xs text-muted-foreground'>{formatDateWithNext(record.next_occurrence)}</p>
                    )}
                    <Badge variant='outline' className={`text-xs ${getUrgencyClass(days)}`}>
                      {getUrgencyLabel(days)}
                    </Badge>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
