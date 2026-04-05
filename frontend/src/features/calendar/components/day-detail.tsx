import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatAmount, daysUntil, getUrgencyLabel, formatTime } from '@/lib/format-date'
import { PERIOD_LABELS } from '@/types'
import type {
  CalendarRecord,
  PaymentRecord,
  SimpleRecord,
} from '@/types'

interface DayDetailProps {
  date: Date
  records: CalendarRecord[]
}

export function DayDetail({ date, records }: DayDetailProps) {
  const dateStr = date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{dateStr}</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className='py-8 text-center'>
            <p className='text-sm text-muted-foreground'>这天没有记录</p>
            <Link to='/create'>
              <Button variant='outline' size='sm' className='mt-2'>
                <Plus className='mr-1 size-3' />
                添加记录
              </Button>
            </Link>
          </div>
        ) : (
          <div className='space-y-3'>
            {records
              .sort((a, b) => {
                const dateA =
                  a.type === 'simple'
                    ? new Date(a.time)
                    : new Date(a.start_time)
                const dateB =
                  b.type === 'simple'
                    ? new Date(b.time)
                    : new Date(b.start_time)
                return dateA.getTime() - dateB.getTime()
              })
              .map((record) => (
                <RecordItem key={record.id} record={record} />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecordItem({ record }: { record: CalendarRecord }) {
  if (record.type === 'payment') {
    return <PaymentRecordItem record={record} />
  }
  return <SimpleRecordItem record={record} />
}

function PaymentRecordItem({ record }: { record: PaymentRecord }) {
  const nextDate = record.next_occurrence
    ? new Date(record.next_occurrence)
    : new Date(record.start_time)
  const days = daysUntil(nextDate.toISOString())

  return (
    <Link
      to='/edit/$id'
      params={{ id: record.id }}
      className='flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent'
    >
      <div
        className={`flex size-8 items-center justify-center rounded-full text-sm ${
          record.direction === 'income'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }`}
      >
        {record.direction === 'income' ? '↗' : '↘'}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{record.name}</p>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{record.category}</span>
          <span>·</span>
          <span>{formatAmount(record.amount, record.currency)}</span>
        </div>
      </div>
      <Badge variant='outline' className='text-xs'>
        {getUrgencyLabel(days)}
      </Badge>
    </Link>
  )
}

function SimpleRecordItem({ record }: { record: SimpleRecord }) {
  const nextDate = record.next_occurrence
    ? new Date(record.next_occurrence)
    : new Date(record.time)
  const days = daysUntil(nextDate.toISOString())

  return (
    <Link
      to='/edit/$id'
      params={{ id: record.id }}
      className='flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent'
    >
      <div className='flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm dark:bg-blue-900 dark:text-blue-300'>
        📅
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{record.name}</p>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{PERIOD_LABELS[record.period]}</span>
          <span>·</span>
          <span>{formatTime(record.time)}</span>
        </div>
      </div>
      <Badge variant='outline' className='text-xs'>
        {getUrgencyLabel(days)}
      </Badge>
    </Link>
  )
}
