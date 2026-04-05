import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmount } from '../../lib/format'
import type { DashboardSummary } from '../../types'

type Period = 'today' | 'week' | 'month'

const periods: { value: Period; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
]

interface SummaryCardsProps {
  summary?: DashboardSummary
  isLoading: boolean
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const [period, setPeriod] = useState<Period>('month')

  const balancePositive = (summary?.balance ?? 0) >= 0

  const cards = [
    {
      key: 'income' as const,
      label: '收入',
      icon: ArrowDownLeft,
      value: summary?.income ?? 0,
      currency: 'CNY',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      valueColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      key: 'expense' as const,
      label: '支出',
      icon: ArrowUpRight,
      value: summary?.expense ?? 0,
      currency: 'CNY',
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
      valueColor: 'text-rose-700 dark:text-rose-400',
    },
    {
      key: 'balance' as const,
      label: '结余',
      icon: Wallet,
      value: summary?.balance ?? 0,
      currency: 'CNY',
      iconColor: balancePositive
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-rose-600 dark:text-rose-400',
      iconBg: balancePositive
        ? 'bg-blue-100 dark:bg-blue-900/50'
        : 'bg-rose-100 dark:bg-rose-900/50',
      valueColor: balancePositive
        ? 'text-blue-700 dark:text-blue-400'
        : 'text-rose-700 dark:text-rose-400',
    },
  ]

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        {periods.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? 'default' : 'outline'}
            size='sm'
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.key} className='relative overflow-hidden'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      card.iconBg
                    )}
                  >
                    <Icon className={cn('h-5 w-5', card.iconColor)} />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm text-muted-foreground'>{card.label}</p>
                    {isLoading ? (
                      <Skeleton className='h-7 w-24' />
                    ) : (
                      <p
                        className={cn(
                          'text-2xl font-bold tracking-tight',
                          card.valueColor
                        )}
                      >
                        {formatAmount(card.value, card.currency)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
