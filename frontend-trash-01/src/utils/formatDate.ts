/**
 * 格式化日期显示
 * - 如果是今天：显示"今天 HH:mm"
 * - 如果是未来：显示"月月日日"
 */
export function formatDateWithNext(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  // 判断是否是今天
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    // 格式化为"今天 HH:mm"
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  } else {
    // 格式化为"月月日日"
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

/**
 * 计算距离今天还有多少天
 */
export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

/**
 * 根据天数返回紧急程度样式类
 */
export function getUrgencyClass(days: number): string {
  if (days <= 3) return 'bg-red-100 text-red-700'
  if (days <= 7) return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}
