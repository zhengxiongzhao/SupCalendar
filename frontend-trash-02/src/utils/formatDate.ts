export function formatDateWithNext(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export function getUrgencyClass(days: number): string {
  if (days <= 3) return 'bg-red-100 text-red-700'
  if (days <= 7) return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

export function calculateEndTime(startTime: string, period: string): string {
  if (!startTime) return ''

  const startDate = new Date(startTime)
  const year = startDate.getFullYear()
  const month = startDate.getMonth()
  const date = startDate.getDate()

  const end = new Date(year, month, date)

  switch (period) {
    case 'week':
      end.setDate(end.getDate() + 7)
      break
    case 'month':
      end.setMonth(end.getMonth() + 1)
      break
    case 'quarter':
      end.setMonth(end.getMonth() + 3)
      break
    case 'half-year':
      end.setMonth(end.getMonth() + 6)
      break
    case 'year':
      end.setFullYear(end.getFullYear() + 1)
      break
  }

  const endYear = end.getFullYear()
  const endMonth = String(end.getMonth() + 1).padStart(2, '0')
  const endDate = String(end.getDate()).padStart(2, '0')

  return `${endYear}-${endMonth}-${endDate}T00:00`
}

export function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : '¥'
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
  return `${symbol}${formattedAmount}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
