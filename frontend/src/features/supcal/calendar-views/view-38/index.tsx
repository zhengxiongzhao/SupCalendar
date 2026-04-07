import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useRecords } from '../../api/records'
import { buildRecordsByDateMap, getRecordDotColor, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView38() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const { days, firstDayOffset } = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    return { days: eachDayOfInterval({ start: ms, end: me }), firstDayOffset: getDay(ms) }
  }, [currentDate])
  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 38 · 雪花视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>冰蓝雪花六角网格</p>
          </div>
        </div>
        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10'><CalendarDays className='h-4 w-4 text-blue-600 dark:text-blue-400' /></div>
            <h2 className='text-lg font-semibold tracking-tight'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button variant='ghost' size='sm' className='h-8 text-xs font-medium' onClick={() => setCurrentDate(new Date())}>今天</Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-4 w-4' /></Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-4 w-4' /></Button>
          </div>
        </div>

        <div className='rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card p-4 shadow-sm'>
          <div className='grid grid-cols-7 gap-px bg-blue-500/5 px-2 pt-2 pb-1'>
            {WEEK_DAYS.map((day) => (
              <div key={day} className={cn('py-1.5 text-center text-[9px] font-bold tracking-wider text-blue-500/60')}>{day}</div>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-1 p-2'>
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`e-${i}`} className='aspect-square rounded-md bg-blue-500/5' />
            ))}
            {days.map((day) => {
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              return (
                <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('group relative flex aspect-square flex-col items-center justify-center rounded-md transition-all duration-200', isCurrentDay && 'bg-blue-500/15 ring-2 ring-blue-500/30', !isCurrentDay && dayRecords.length > 0 && 'bg-blue-500/5', !isCurrentDay && dayRecords.length === 0 && 'hover:bg-blue-500/5', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium', isCurrentDay ? 'bg-blue-500 text-white font-bold shadow-sm' : 'text-foreground/60')}>{fmt(day, 'd')}</span>
                  {dayRecords.length > 0 && (
                    <div className='mt-0.5 flex gap-0.5'>
                      {dayRecords.slice(0, 3).map((r, idx) => (
                        <span key={idx} className={cn('h-1 w-1 rounded-full', getRecordDotColor(r))} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <svg className='w-full h-8 text-blue-500/20' viewBox='0 0 800 30' preserveAspectRatio='none'>
            <path d='M400 5 L410 15 L400 12 L390 15 Z M0 15 L800 15' fill='none' stroke='currentColor' strokeWidth='0.5' />
            <line x1='400' y1='0' x2='400' y2='30' stroke='currentColor' strokeWidth='0.5' />
            <line x1='390' y1='3' x2='410' y2='27' stroke='currentColor' strokeWidth='0.3' />
            <line x1='410' y1='3' x2='390' y2='27' stroke='currentColor' strokeWidth='0.3' />
          </svg>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
