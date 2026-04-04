'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'
import { useRecordsStore } from '@/stores/records'
import { MonthCalendar } from '@/components/calendar/MonthCalendar'
import { DayRecords } from '@/components/calendar/DayRecords'
import { Button } from '@/components/ui/button'
import type { SimpleRecord, PaymentRecord, CalendarRecord } from '@/types'

export default function CalendarPage() {
  const { records, fetchRecords, loading } = useRecordsStore()
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const calendarEvents = useMemo(() => {
    return records.map((record): { date: Date } => {
      const dateStr =
        record.type === 'simple'
          ? (record as SimpleRecord).time
          : (record as PaymentRecord).start_time
      return { date: new Date(dateStr) }
    })
  }, [records])

  const selectedDateRecords = useMemo(() => {
    const dateStr = selectedDate.toDateString()
    return records.filter((record): boolean => {
      const recordDateStr =
        record.type === 'simple'
          ? new Date((record as SimpleRecord).time).toDateString()
          : new Date((record as PaymentRecord).start_time).toDateString()
      return recordDateStr === dateStr
    })
  }, [records, selectedDate])

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">日历视图</h1>
        <Link href="/create">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">新建记录</span>
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onMonthChange={() => {}}
              events={calendarEvents}
            />
          </div>

          <div>
            <DayRecords date={selectedDate} records={selectedDateRecords} />
          </div>
        </div>
      )}
    </div>
  )
}
