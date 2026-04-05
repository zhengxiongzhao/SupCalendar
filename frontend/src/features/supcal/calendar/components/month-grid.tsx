import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isToday,
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

function getRecordColor(record: CalendarRecord): string {
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
    <div className='grid grid-cols-7 gap-px rounded-lg border bg-border p-px overflow-hidden'>
      {weekDays.map((day) => (
        <div
          key={day}
          className='bg-muted px-1 py-2 text-center text-xs font-medium text-muted-foreground'
        >
          {day}
        </div>
      ))}

      {Array.from({ length: firstDayOffset }).map((_, i) => (
        <div key={`empty-${i}`} className='bg-background p-1.5 min-h-[72px]' />
      ))}

      {days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const dayRecords = recordsByDate.get(dateKey) || []
        const isCurrentDay = isToday(day)

        return (
          <button
            key={dateKey}
            onClick={() => onDayClick(day)}
            className='relative bg-background p-1.5 text-left transition-colors min-h-[72px] hover:bg-muted/50'
          >
            <span
              className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm',
                isCurrentDay &&
                  'bg-primary text-primary-foreground font-semibold'
              )}
            >
              {format(day, 'd')}
            </span>
            {dayRecords.length > 0 && (
              <div className='mt-1 flex flex-wrap gap-0.5'>
                {dayRecords.slice(0, 3).map((record, idx) => (
                  <span
                    key={`${record.id}-${idx}`}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      getRecordColor(record)
                    )}
                  />
                ))}
                {dayRecords.length > 3 && (
                  <span className='text-[8px] text-muted-foreground'>
                    +{dayRecords.length - 3}
                  </span>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
