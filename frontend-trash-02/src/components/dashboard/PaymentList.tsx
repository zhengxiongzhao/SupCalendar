'use client'

import Link from 'next/link'
import { DollarSign, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PaymentRecord } from '@/types'
import { formatAmount, formatDateWithNext, daysUntil, getUrgencyClass } from '@/utils/formatDate'

interface PaymentListProps {
  records: PaymentRecord[]
}

export function PaymentList({ records }: PaymentListProps) {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">收付款 TOP 10</CardTitle>
          <p className="text-sm text-muted-foreground">按金额排序</p>
        </div>
        <Link href="/records?filter=payment">
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
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">暂无收付款记录</p>
            <Link href="/create">
              <Button variant="link" className="mt-3">
                添加一条
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
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0",
                    record.direction === 'income' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                  )}
                >
                  {record.direction === 'income' ? <ArrowUpRight /> : <ArrowDownRight />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{record.name}</p>
                  <p className="text-sm text-muted-foreground">{record.category}</p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    record.direction === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {record.direction === 'income' ? '+' : '-'}
                    {formatAmount(record.amount, record.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateWithNext(record.next_occurrence || '无')}
                  </p>
                  {record.next_occurrence && (
                    <Badge
                      variant="outline"
                      className={cn("mt-1", getUrgencyClass(daysUntil(record.next_occurrence)))}
                    >
                      {daysUntil(record.next_occurrence)} 天后
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
