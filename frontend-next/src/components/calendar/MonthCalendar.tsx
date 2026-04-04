'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SimpleRecord, PaymentRecord } from '@/types'

interface MonthCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onMonthChange: (year: number, month: number) => void
  events: Array<{ date: Date }>
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

export function MonthCalendar({ selectedDate, onDateSelect, onMonthChange, events }: MonthCalendarProps) {
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth())

  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    })
  }, [currentYear, currentMonth])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDay.getDay()

    const days: Array<{
      date: Date
      dayNumber: number
      isCurrentMonth: boolean
      isToday: boolean
      isSelected: boolean
      hasEvents: boolean
      eventCount: number
    }> = []

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, lastDay.getDate() - i)
      days.push(createDayData(date, false))
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i)
      days.push(createDayData(date, true))
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(currentYear, currentMonth + 1, i)
      days.push(createDayData(date, false))
    }

    return days
  }, [currentYear, currentMonth, selectedDate, events])

  function createDayData(date: Date, isCurrentMonth: boolean) {
    const today = new Date()
    const todayStr = formatDateToString(today)
    const dateStr = formatDateToString(date)
    const selectedStr = formatDateToString(selectedDate)

    const dayEvents = events.filter((e) => formatDateToString(e.date) === dateStr)

    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: todayStr === dateStr,
      isSelected: selectedStr === dateStr,
      hasEvents: dayEvents.length > 0,
      eventCount: dayEvents.length,
    }
  }

  function formatDateToString(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    onMonthChange(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    onMonthChange(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1)
  }

  function goToToday() {
    const today = new Date()
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    onDateSelect(today)
    onMonthChange(today.getFullYear(), today.getMonth())
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="hidden sm:inline-flex"
          >
            今天
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="touch-manipulation"
            aria-label="上个月"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="touch-manipulation"
            aria-label="下个月"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className={cn(
              "text-center text-sm font-medium py-2",
              day === '日' || day === '六' ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => (
          <button
            key={day.date.toISOString()}
            onClick={() => onDateSelect(day.date)}
            className={cn(
              "relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all touch-manipulation",
              day.isCurrentMonth ? "text-foreground" : "text-muted/50",
              day.isSelected 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent",
              day.isToday && !day.isSelected && "ring-2 ring-ring ring-inset"
            )}
            aria-label={day.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            aria-selected={day.isSelected}
          >
            <span>{day.dayNumber}</span>
            {day.hasEvents && (
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: Math.min(day.eventCount, 3) }).map((_, i) => (
                  <div
                    key={i}
                    className={cn("w-1.5 h-1.5 rounded-full", day.isSelected ? "bg-primary-foreground" : "bg-primary")}
                  />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
