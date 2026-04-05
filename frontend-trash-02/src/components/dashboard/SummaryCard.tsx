import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  amount: number
  type: 'income' | 'expense' | 'balance'
  icon: string
}

const colors = {
  income: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400',
  expense: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400',
  balance: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
}

const iconBgColors = {
  income: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
  expense: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
  balance: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
}

export function SummaryCard({ title, amount, type, icon }: SummaryCardProps) {
  return (
    <Card className={cn(colors[type])}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium opacity-70">{title}</p>
            <p className="text-lg font-bold mt-0.5 truncate">
              ¥{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </p>
          </div>
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0", iconBgColors[type])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
