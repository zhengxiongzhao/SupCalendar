import { useNavigate } from '@tanstack/react-router'
import { ArrowDownLeft, ArrowUpRight, Calendar, Clock } from 'lucide-react'
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
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          payment.direction === 'income'
            ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
        )}
      >
        {payment.direction === 'income' ? (
          <ArrowDownLeft className='h-5 w-5' />
        ) : (
          <ArrowUpRight className='h-5 w-5' />
        )}
      </div>
    )
  }
  return (
    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'>
      <Clock className='h-5 w-5' />
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
      className={cn(
        'group flex w-full items-center gap-3.5 rounded-xl border border-border/50 p-3.5 text-start transition-all duration-200',
        'hover:border-border hover:bg-accent/50 hover:shadow-sm',
        'active:scale-[0.99]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <RecordIcon record={record} />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <p className='truncate text-sm font-medium leading-tight'>
            {record.name}
          </p>
          <Badge
            variant='secondary'
            className='shrink-0 rounded-md border-border/50 bg-muted/50 text-[10px] font-normal'
          >
            每{periodLabels[record.period]}
          </Badge>
        </div>
        <div className='mt-1 flex items-center gap-2'>
          {record.type === 'payment' && (
            <p
              className={cn(
                'text-sm font-semibold tabular-nums',
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
            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Calendar className='h-3 w-3' />
              提醒
            </span>
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
      <SheetContent
        side='bottom'
        className='mx-auto max-h-[80vh] rounded-t-2xl border-t-2 border-primary/10 sm:max-w-lg'
      >
        <SheetHeader className='pb-2'>
          <SheetTitle className='text-lg font-semibold tracking-tight'>
            {date
              ? format(date, 'M月d日 EEEE', { locale: zhCN })
              : '选择日期'}
          </SheetTitle>
          <SheetDescription className='text-sm text-muted-foreground'>
            {records.length > 0 ? `${records.length} 条记录` : '暂无记录'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className='h-[calc(80vh-8rem)] sm:h-[calc(100vh-8rem)] px-4'>
          {records.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-3 py-16'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60'>
                <Calendar className='h-6 w-6 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground'>当天暂无记录</p>
            </div>
          ) : (
            <div className='space-y-2.5 pb-8'>
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
