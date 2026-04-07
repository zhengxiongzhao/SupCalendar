import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
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
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              查看你的收付款和提醒安排
            </p>
          </div>
        </div>

        <div className='mb-5 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
              <CalendarDays className='h-4 w-4 text-primary' />
            </div>
            <h2 className='text-lg font-semibold tracking-tight'>
              {format(currentDate, 'yyyy年M月', { locale: zhCN })}
            </h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 text-xs font-medium'
              onClick={() => setCurrentDate(new Date())}
            >
              今天
            </Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-lg'
              onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-lg'
              onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm'>
            <div className='grid grid-cols-7 border-b border-border/60 bg-muted/30'>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className='px-1 py-2.5 text-center text-xs text-muted-foreground'
                >
                  {[ '日', '一', '二', '三', '四', '五', '六'][i]}
                </div>
              ))}
            </div>
            <div className='grid grid-cols-7'>
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className='border-b border-r border-border/30 p-2'
                >
                  <div className='h-7 w-7 animate-pulse rounded-lg bg-muted' />
                  <div className='mt-2 flex gap-1'>
                    <div className='h-3 w-8 animate-pulse rounded-full bg-muted' />
                  </div>
                </div>
              ))}
            </div>
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
