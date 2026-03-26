interface SummaryCardProps {
  title: string
  amount: number
  type: 'income' | 'expense' | 'balance'
  icon: string
}

const colors = {
  income: 'bg-green-50 border-green-200 text-green-700',
  expense: 'bg-red-50 border-red-200 text-red-700',
  balance: 'bg-blue-50 border-blue-200 text-blue-700',
}

const iconBgColors = {
  income: 'bg-green-100 text-green-600',
  expense: 'bg-red-100 text-red-600',
  balance: 'bg-blue-100 text-blue-600',
}

export function SummaryCard({ title, amount, type, icon }: SummaryCardProps) {
  return (
    <div className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${colors[type]}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-70">{title}</p>
          <p className="text-lg font-bold mt-0.5 truncate">
            ¥{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </p>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${iconBgColors[type]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
