import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmount, formatDate } from '../../lib/format'
import { daysUntil, periodLabels } from '../../lib/urgency'
import { UrgencyBadge } from '../../components/urgency-badge'
import type { CalendarRecord, PaymentRecord } from '../../types'

interface RecordsTableProps {
  data: CalendarRecord[]
  filter?: 'all' | 'payment' | 'simple'
  isLoading: boolean
}

function LoadingSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full' />
      ))}
    </div>
  )
}

export function RecordsTable({ data, isLoading }: RecordsTableProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <p className='text-sm text-muted-foreground'>暂无记录</p>
      </div>
    )
  }

  function handleRowClick(record: CalendarRecord) {
    void navigate({ to: '/supcal/edit/$id', params: { id: record.id } })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名称</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>金额</TableHead>
          <TableHead>分类</TableHead>
          <TableHead>周期</TableHead>
          <TableHead>下次时间</TableHead>
          <TableHead>紧迫度</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record) => {
          const isPayment = record.type === 'payment'
          const payment = isPayment ? (record as PaymentRecord) : null
          const days = daysUntil(record.next_occurrence || '')

          return (
            <TableRow
              key={record.id}
              className='cursor-pointer'
              onClick={() => handleRowClick(record)}
            >
              <TableCell className='font-medium'>{record.name}</TableCell>
              <TableCell>
                {isPayment ? (
                  <Badge variant='secondary'>
                    {payment!.direction === 'income' ? '收入' : '支出'}
                  </Badge>
                ) : (
                  <Badge variant='outline'>提醒</Badge>
                )}
              </TableCell>
              <TableCell>
                {isPayment ? (
                  <span
                    className={cn(
                      'font-semibold',
                      payment!.direction === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    )}
                  >
                    {payment!.direction === 'income' ? '+' : '-'}
                    {formatAmount(payment!.amount, payment!.currency)}
                  </span>
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )}
              </TableCell>
              <TableCell>
                {isPayment
                  ? (payment!.category || (
                      <span className='text-muted-foreground'>未分类</span>
                    ))
                  : '-'}
              </TableCell>
              <TableCell>
                每{periodLabels[record.period]}
              </TableCell>
              <TableCell>
                {record.next_occurrence
                  ? formatDate(record.next_occurrence)
                  : '-'}
              </TableCell>
              <TableCell>
                <UrgencyBadge days={days} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
