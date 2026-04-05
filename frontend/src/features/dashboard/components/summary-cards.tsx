import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAmount } from '@/lib/format-date'

interface SummaryCardsProps {
  income: number
  expense: number
  balance: number
  currency?: string
}

export function SummaryCards({ income, expense, balance, currency = 'CNY' }: SummaryCardsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>本月收入</CardTitle>
          <TrendingUp className='size-4 text-emerald-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
            {formatAmount(income, currency)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>本月支出</CardTitle>
          <TrendingDown className='size-4 text-red-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
            {formatAmount(expense, currency)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>本月结余</CardTitle>
          <Wallet className='size-4 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatAmount(balance, currency)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
