import { Link } from '@tanstack/react-router'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PaymentRecord } from '@/types'
import { formatAmount, daysUntil, getUrgencyClass, getUrgencyLabel } from '@/lib/format-date'

interface TopPaymentsProps {
  records: PaymentRecord[]
}

export function TopPayments({ records }: TopPaymentsProps) {
  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>金额 TOP</CardTitle>
          <CardDescription>按金额排序的收付款记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <p className='text-sm text-muted-foreground'>暂无收付款记录</p>
            <Link to='/create'>
              <Button variant='outline' size='sm' className='mt-3'>
                添加第一条记录
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
        <CardTitle>金额 TOP</CardTitle>
        <CardDescription>按金额排序的收付款记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {records.map((record) => {
            const days = record.next_occurrence ? daysUntil(record.next_occurrence) : 999
            return (
              <Link
                key={record.id}
                to='/edit/$id'
                params={{ id: record.id }}
                className='flex items-center justify-between rounded-lg p-3 hover:bg-accent transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <div className={`flex size-8 items-center justify-center rounded-full ${record.direction === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                    {record.direction === 'income' ? <TrendingUp className='size-4' /> : <TrendingDown className='size-4' />}
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{record.name}</p>
                    <p className='text-xs text-muted-foreground'>{record.category || '未分类'}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-right'>
                    <p className={`text-sm font-semibold ${record.direction === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {record.direction === 'income' ? '+' : '-'}{formatAmount(record.amount, record.currency)}
                    </p>
                    {record.next_occurrence && (
                      <Badge variant='outline' className={`text-xs ${getUrgencyClass(days)}`}>
                        {getUrgencyLabel(days)}
                      </Badge>
                    )}
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
