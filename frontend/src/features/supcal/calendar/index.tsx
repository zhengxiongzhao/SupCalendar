import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, subMonths, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRecords } from '../api/records'
import { MonthGrid } from './components/month-grid'
import { getOccurrencesInMonth } from './components/month-grid'
import { DayDetailSheet } from './components/day-detail-sheet'
import type { CalendarRecord } from '../types'

export function SupcalCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate || !recordsQuery.data) return []
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const dayKey = format(selectedDate, 'yyyy-MM-dd')

    const result: CalendarRecord[] = []
    for (const record of recordsQuery.data) {
      const occurrences = getOccurrencesInMonth(record, year, month)
      if (occurrences.some((d) => format(d, 'yyyy-MM-dd') === dayKey)) {
        result.push(record)
      }
    }
    return result
  }, [selectedDate, recordsQuery.data])

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>日历视图</h1>
          <p className='text-muted-foreground'>
            查看你的收付款和提醒安排
          </p>
        </div>

        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>
            {format(currentDate, 'yyyy年M月', { locale: zhCN })}
          </h2>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setCurrentDate(new Date())}
            >
              今天
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='grid grid-cols-7 gap-px rounded-lg border bg-border p-px overflow-hidden'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className='bg-muted px-1 py-2 text-center text-xs'>
                -
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className='bg-background h-[72px] animate-pulse'
              />
            ))}
          </div>
        ) : (
          <MonthGrid
            currentDate={currentDate}
            records={recordsQuery.data}
            onDayClick={handleDayClick}
          />
        )}
      </Main>

      <DayDetailSheet
        date={selectedDate}
        records={recordsForSelectedDate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
