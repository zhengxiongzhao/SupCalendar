import { Badge } from '@/components/ui/badge'
import { periodLabels } from '../lib/urgency'
import type { PeriodType } from '../types'

interface PeriodDisplayProps {
  period: PeriodType
  className?: string
}

export function PeriodDisplay({ period, className }: PeriodDisplayProps) {
  const label = periodLabels[period] || period

  return (
    <Badge variant='secondary' className={className}>
      每{label}
    </Badge>
  )
}
