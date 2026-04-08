import { useNavigate } from '@tanstack/react-router'
import { ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { UrgencyBadge } from '../../components/urgency-badge'
import { formatAmount, formatDate } from '../../lib/format'
import { daysUntil, periodLabels } from '../../lib/urgency'
import type { CalendarRecord, PaymentRecord, SimpleRecord } from '../../types'

interface UpcomingListProps {
  records?: CalendarRecord[]
  isLoading: boolean
}

function RecordIcon({ record }: { record: CalendarRecord }) {
  if (record.type === 'payment') {
    const payment = record as PaymentRecord
    return (
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          payment.direction === 'income'
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
            : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
        )}
      >
        {payment.direction === 'income' ? (
          <ArrowDownLeft className='h-4 w-4' />
        ) : (
          <ArrowUpRight className='h-4 w-4' />
        )}
      </div>
    )
  }

  return (
    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'>
      <Calendar className='h-4 w-4' />
    </div>
  )
}

export function UpcomingList({ records, isLoading }: UpcomingListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  if (!records?.length) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <p className='text-sm text-muted-foreground'>暂无即将到来的记录</p>
        <button
          onClick={() => navigate({ to: '/supcal/create' })}
          className='mt-2 text-sm text-primary underline-offset-4 hover:underline'
        >
          立即创建
        </button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div>
          <CardTitle className='text-base'>即将到来</CardTitle>
          <CardDescription>近期到期的提醒和记录</CardDescription>
        </div>
        <button
          onClick={() => navigate({ to: '/supcal/records' })}
          className='text-sm text-primary hover:underline'
        >
          查看全部
        </button>
      </CardHeader>
      <CardContent>
        <div className='space-y-1'>
          {records.map((record) => {
            const days = daysUntil(record.next_occurrence || '')
            const isPayment = record.type === 'payment'

            return (
              <button
                key={record.id}
                onClick={() => navigate({ to: `/supcal/edit/${record.id}` })}
                className='flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50'
              >
                <div className='flex items-center gap-3'>
                  <RecordIcon record={record} />
                  <div>
                    <p className='text-sm font-medium'>{record.name}</p>
                    <div className='flex items-center gap-2'>
                      {isPayment ? (
                        <span className='text-xs text-muted-foreground'>
                          {((record as PaymentRecord).category && Array.isArray((record as PaymentRecord).category))
                            ? (record as PaymentRecord).category!.join(', ')
                            : '未分类'}
                        </span>
                      ) : (
                        <Badge variant='outline' className='px-1.5 py-0 text-[10px]'>
                          {periodLabels[(record as SimpleRecord).period]}
                        </Badge>
                      )}
                      {record.next_occurrence && (
                        <span className='text-xs text-muted-foreground'>
                          {formatDate(record.next_occurrence)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='text-right'>
                    {isPayment && (
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          (record as PaymentRecord).direction === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        )}
                      >
                        {(record as PaymentRecord).direction === 'income' ? '+' : '-'}
                        {formatAmount((record as PaymentRecord).amount, (record as PaymentRecord).currency)}
                      </p>
                    )}
                  </div>
                  <UrgencyBadge days={days} />
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
