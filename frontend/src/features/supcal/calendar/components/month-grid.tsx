import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isToday,
  isWeekend,
} from 'date-fns'
import type {
  CalendarRecord,
  PaymentRecord,
  SimpleRecord,
  PeriodType,
} from '../../types'

interface MonthGridProps {
  currentDate: Date
  records?: CalendarRecord[]
  onDayClick: (date: Date) => void
}

function addPeriodToDate(date: Date, period: PeriodType): Date {
  const result = new Date(date)
  switch (period) {
    case 'week':
      result.setDate(result.getDate() + 7)
      break
    case 'month':
      result.setMonth(result.getMonth() + 1)
      break
    case 'quarter':
      result.setMonth(result.getMonth() + 3)
      break
    case 'half-year':
      result.setMonth(result.getMonth() + 6)
      break
    case 'year':
      result.setFullYear(result.getFullYear() + 1)
      break
  }
  return result
}

export function getOccurrencesInMonth(
  record: CalendarRecord,
  year: number,
  month: number
): Date[] {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

  const startTime =
    record.type === 'payment'
      ? (record as PaymentRecord).start_time
      : (record as SimpleRecord).time
  const endTime =
    record.type === 'payment'
      ? (record as PaymentRecord).end_time
      : null
  const period = record.period

  if (!startTime) return []

  const startDate = new Date(startTime)
  const endDate = endTime ? new Date(endTime) : null

  if (startDate > monthEnd) return []

  const occurrences: Date[] = []
  let current = new Date(startDate)

  while (current < monthStart) {
    if (endDate && current > endDate) return []
    const next = addPeriodToDate(current, period)
    if (next.getTime() <= current.getTime()) return []
    current = next
  }

  while (current <= monthEnd) {
    if (endDate && current > endDate) break
    if (current >= monthStart) {
      occurrences.push(
        new Date(current.getFullYear(), current.getMonth(), current.getDate())
      )
    }
    const next = addPeriodToDate(current, period)
    if (next.getTime() <= current.getTime()) break
    current = next
  }

  return occurrences
}

function getRecordDotColor(record: CalendarRecord): string {
  if (record.type === 'payment') {
    return (record as PaymentRecord).direction === 'income'
      ? 'bg-emerald-500'
      : 'bg-rose-500'
  }
  return 'bg-blue-500'
}

export function MonthGrid({ currentDate, records, onDayClick }: MonthGridProps) {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const { days, firstDayOffset } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const offset = getDay(monthStart)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])

  const recordsByDate = useMemo(() => {
    const map = new Map<string, CalendarRecord[]>()
    if (!records) return map

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    for (const record of records) {
      const occurrences = getOccurrencesInMonth(record, year, month)
      for (const date of occurrences) {
        const key = format(date, 'yyyy-MM-dd')
        const existing = map.get(key) || []
        existing.push(record)
        map.set(key, existing)
      }
    }

    return map
  }, [records, currentDate])

  return (
    <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
      <div className='grid grid-cols-7 gap-1.5 px-2 pt-3 pb-1'>
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={cn(
              'py-2 text-center text-[11px] font-semibold tracking-[0.08em]',
              idx === 0 || idx === 6
                ? 'text-rose-500/60 dark:text-rose-400/50'
                : 'text-muted-foreground/60'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1.5 p-2'>
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className='rounded-xl bg-muted/5 min-h-[72px] sm:min-h-[94px]'
          />
        ))}

        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayRecords = recordsByDate.get(dateKey) || []
          const isCurrentDay = isToday(day)
          const isWeekendDay = isWeekend(day)
          const incomeCount = dayRecords.filter(
            (r) =>
              r.type === 'payment' &&
              (r as PaymentRecord).direction === 'income'
          ).length
          const expenseCount = dayRecords.filter(
            (r) =>
              r.type === 'payment' &&
              (r as PaymentRecord).direction === 'expense'
          ).length
          const reminderCount = dayRecords.filter(
            (r) => r.type === 'simple'
          ).length

          return (
            <button
              key={dateKey}
              onClick={() => onDayClick(day)}
              className={cn(
                'group relative rounded-xl p-1.5 sm:p-2.5 text-left transition-all duration-200 ease-out min-h-[72px] sm:min-h-[94px]',
                'bg-background hover:bg-accent/60 hover:shadow-sm',
                isCurrentDay &&
                  'ring-[1.5px] ring-primary/30 bg-primary/5',
                isWeekendDay &&
                  !isCurrentDay &&
                  'bg-muted/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
              )}
            >
              <div className='flex items-start justify-between'>
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] transition-all duration-200',
                    isCurrentDay
                      ? 'bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25'
                      : isWeekendDay
                        ? 'font-medium text-rose-600/75 dark:text-rose-400/65'
                        : 'font-medium text-foreground/70 group-hover:text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayRecords.length > 0 && (
                  <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary/10 px-1 text-[9px] font-bold text-primary tabular-nums leading-none'>
                    {dayRecords.length}
                  </span>
                )}
              </div>

              {dayRecords.length > 0 && (
                <div className='mt-1 flex flex-wrap gap-[3px]'>
                  {incomeCount > 0 && (
                    <span className='inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-[2px] text-[9px] font-semibold leading-none text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20'>
                      +{incomeCount}
                    </span>
                  )}
                  {expenseCount > 0 && (
                    <span className='inline-flex items-center rounded-full bg-rose-500/15 px-1.5 py-[2px] text-[9px] font-semibold leading-none text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/20'>
                      -{expenseCount}
                    </span>
                  )}
                  {reminderCount > 0 && (
                    <span className='inline-flex items-center rounded-full bg-blue-500/15 px-1.5 py-[2px] text-[9px] font-semibold leading-none text-blue-700 dark:text-blue-400 ring-1 ring-blue-500/20'>
                      {reminderCount}
                    </span>
                  )}
                </div>
              )}

              {dayRecords.length > 0 && (
                <div className='absolute bottom-1.5 left-2.5 right-2.5 flex gap-[2px] sm:bottom-2'>
                  {dayRecords.slice(0, 5).map((record, idx) => (
                    <span
                      key={`${record.id}-${idx}`}
                      className={cn(
                        'h-[3px] flex-1 rounded-full transition-all duration-200 group-hover:h-[4px]',
                        getRecordDotColor(record)
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
