import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getUrgencyClasses } from '../lib/urgency'

interface UrgencyBadgeProps {
  days: number
  className?: string
}

export function UrgencyBadge({ days, className }: UrgencyBadgeProps) {
  const label =
    days < 0
      ? '已过期'
      : days === 0
        ? '今天'
        : days <= 3
          ? `${days} 天后`
          : days <= 7
            ? '即将到来'
            : `${days} 天后`

  return (
    <Badge
      variant='outline'
      className={cn('text-xs', getUrgencyClasses(days), className)}
    >
      {label}
    </Badge>
  )
}
