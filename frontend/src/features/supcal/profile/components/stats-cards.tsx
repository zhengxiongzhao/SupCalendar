import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmount } from '../../lib/format'
import type { ProfileStats } from '../../types'

interface StatsCardsProps {
  stats?: ProfileStats
  isLoading: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      key: 'total_records',
      label: '总记录数',
      icon: ListChecks,
      value: stats?.total_records ?? 0,
      display: String(stats?.total_records ?? 0),
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    },
    {
      key: 'total_income',
      label: '总收入',
      icon: ArrowDownLeft,
      value: stats?.total_income ?? 0,
      display: formatAmount(stats?.total_income ?? 0, 'CNY'),
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    },
    {
      key: 'total_expense',
      label: '总支出',
      icon: ArrowUpRight,
      value: stats?.total_expense ?? 0,
      display: formatAmount(stats?.total_expense ?? 0, 'CNY'),
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    },
    {
      key: 'this_month',
      label: '本月记录',
      icon: Calendar,
      value: stats?.this_month_records ?? 0,
      display: String(stats?.this_month_records ?? 0),
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.key}>
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
                    <p className='text-2xl font-bold tracking-tight'>
                      {card.display}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
