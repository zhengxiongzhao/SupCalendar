'use client'

import * as React from 'react'
import { type DayButton } from 'react-day-picker'
import { zhCN } from 'date-fns/locale/zh-CN'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { CalendarRecord } from '@/types'

interface DateEventInfo {
  hasIncome: boolean
  hasExpense: boolean
  hasSimple: boolean
}

interface MonthCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  records: CalendarRecord[]
}

function buildDateEventMap(records: CalendarRecord[]): Map<string, DateEventInfo> {
  const map = new Map<string, DateEventInfo>()

  function markDate(dateStr: string, record: CalendarRecord) {
    const info = map.get(dateStr) ?? {
      hasIncome: false,
      hasExpense: false,
      hasSimple: false,
    }
    if (record.type === 'payment') {
      if (record.direction === 'income') info.hasIncome = true
      else info.hasExpense = true
    } else {
      info.hasSimple = true
    }
    map.set(dateStr, info)
  }

  for (const record of records) {
    const baseDateStr =
      record.type === 'simple'
        ? new Date(record.time).toDateString()
        : new Date(record.start_time).toDateString()
    markDate(baseDateStr, record)

    if (record.next_occurrence) {
      markDate(new Date(record.next_occurrence).toDateString(), record)
    }
  }

  return map
}

interface DotDayButtonProps {
  dateEventMap: Map<string, DateEventInfo>
}

function DotDayButton({ dateEventMap }: DotDayButtonProps) {
  return function CalendarDayButtonWithDots({
    className,
    day,
    modifiers,
    children,
    ...props
  }: React.ComponentProps<typeof DayButton>) {
    const ref = React.useRef<HTMLButtonElement>(null)

    React.useEffect(() => {
      if (modifiers.focused) ref.current?.focus()
    }, [modifiers.focused])

    const dateStr = day.date.toDateString()
    const events = dateEventMap.get(dateStr)

    return (
      <button
        ref={ref}
        type='button'
        data-day={day.date.toLocaleDateString()}
        data-selected-single={
          modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle
        }
        data-range-start={modifiers.range_start}
        data-range-end={modifiers.range_end}
        data-range-middle={modifiers.range_middle}
        className={cn(
          'flex aspect-square size-auto w-full min-w-(--cell-size: --spacing(8)) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70',
          className
        )}
        {...props}
      >
        {children}
        {events && (
          <span className='flex items-center justify-center gap-0.5'>
            {events.hasSimple && (
              <span className='size-1.5 rounded-full bg-blue-500' />
            )}
            {events.hasIncome && (
              <span className='size-1.5 rounded-full bg-emerald-500' />
            )}
            {events.hasExpense && (
              <span className='size-1.5 rounded-full bg-red-500' />
            )}
          </span>
        )}
      </button>
    )
  }
}

export function MonthCalendar({
  selectedDate,
  onDateSelect,
  records,
}: MonthCalendarProps) {
  const dateEventMap = React.useMemo(
    () => buildDateEventMap(records),
    [records]
  )

  const CustomDayButton = React.useMemo(
    () => DotDayButton({ dateEventMap }),
    [dateEventMap]
  )

  return (
    <div className='flex flex-col gap-4'>
      <Calendar
        mode='single'
        selected={selectedDate}
        onSelect={(date) => {
          if (date) onDateSelect(date)
        }}
        locale={zhCN}
        components={{
          DayButton: CustomDayButton,
        }}
        className='rounded-md border'
      />
    </div>
  )
}
