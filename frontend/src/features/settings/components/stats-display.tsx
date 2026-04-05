import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react'
import { formatAmount } from '@/lib/format-date'

interface StatsDisplayProps {
  stats: {
    total_records: number
    total_income: number
    total_expense: number
    this_month_records: number
  }
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  const statCards = [
    {
      title: '总记录数',
      value: stats.total_records.toString(),
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: '总收入',
      value: formatAmount(stats.total_income),
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: '总支出',
      value: formatAmount(stats.total_expense),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      title: '本月记录',
      value: stats.this_month_records.toString(),
      icon: CalendarDays,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            <card.icon className={`size-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
