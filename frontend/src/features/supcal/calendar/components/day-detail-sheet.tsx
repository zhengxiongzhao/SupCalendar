import { useNavigate } from '@tanstack/react-router'
import { ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { UrgencyBadge } from '../../components/urgency-badge'
import { formatAmount } from '../../lib/format'
import { daysUntil, periodLabels } from '../../lib/urgency'
import type { CalendarRecord, PaymentRecord } from '../../types'

interface DayDetailSheetProps {
  date: Date | null
  records: CalendarRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function RecordIcon({ record }: { record: CalendarRecord }) {
  if (record.type === 'payment') {
    const payment = record as PaymentRecord
    return (
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          payment.direction === 'income'
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
            : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
        )}
      >
        {payment.direction === 'income' ? (
          <ArrowDownLeft className='h-4 w-4' />
        ) : (
          <ArrowUpRight className='h-4 w-4' />
        )}
      </div>
    )
  }
  return (
    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'>
      <Calendar className='h-4 w-4' />
    </div>
  )
}

function RecordItem({
  record,
  onClose,
}: {
  record: CalendarRecord
  onClose: () => void
}) {
  const navigate = useNavigate()

  function handleClick() {
    onClose()
    navigate({ to: `/supcal/edit/${record.id}` })
  }

  const nextOccurrence = record.next_occurrence
  const urgencyDays = nextOccurrence ? daysUntil(nextOccurrence) : 999

  return (
    <button
      onClick={handleClick}
      className='flex w-full items-center gap-3 rounded-lg border p-3 text-start transition-colors hover:bg-muted/50'
    >
      <RecordIcon record={record} />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <p className='truncate text-sm font-medium'>{record.name}</p>
          <Badge variant='secondary' className='shrink-0 text-[10px]'>
            每{periodLabels[record.period]}
          </Badge>
        </div>
        <div className='mt-0.5 flex items-center gap-2'>
          {record.type === 'payment' && (
            <p
              className={cn(
                'text-sm font-semibold',
                (record as PaymentRecord).direction === 'income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {(record as PaymentRecord).direction === 'income' ? '+' : '-'}
              {formatAmount(
                (record as PaymentRecord).amount,
                (record as PaymentRecord).currency
              )}
            </p>
          )}
          {record.type === 'simple' && (
            <span className='text-xs text-muted-foreground'>提醒</span>
          )}
          {urgencyDays < 999 && (
            <UrgencyBadge days={urgencyDays} className='text-[10px]' />
          )}
        </div>
      </div>
    </button>
  )
}

export function DayDetailSheet({
  date,
  records,
  open,
  onOpenChange,
}: DayDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='mx-auto max-h-[80vh] rounded-t-xl sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>
            {date
              ? format(date, 'M月d日 EEEE', { locale: zhCN })
              : '选择日期'}
          </SheetTitle>
          <SheetDescription>
            {records.length > 0 ? `${records.length} 条记录` : '暂无记录'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className='h-[calc(80vh-8rem)] sm:h-[calc(100vh-8rem)] px-4'>
          {records.length === 0 ? (
            <div className='flex items-center justify-center py-12'>
              <p className='text-sm text-muted-foreground'>当天暂无记录</p>
            </div>
          ) : (
            <div className='space-y-2 pb-6'>
              {records.map((record) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  onClose={() => onOpenChange(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
