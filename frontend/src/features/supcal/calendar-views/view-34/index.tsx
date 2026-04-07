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

export function CalendarView34() {
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

  const blobs = useMemo(() => days.map(() => ({
    r1: 30 + Math.random() * 40,
    r2: 30 + Math.random() * 40,
    r3: 30 + Math.random() * 40,
    r4: 30 + Math.random() * 40,
  })), [days])

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 34 · 流体布局</h1>
            <p className='mt-1 text-sm text-muted-foreground'>有机流体形状日历</p>
          </div>
        </div>
        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'><CalendarDays className='h-4 w-4 text-primary' /></div>
            <h2 className='text-lg font-semibold tracking-tight'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button variant='ghost' size='sm' className='h-8 text-xs font-medium' onClick={() => setCurrentDate(new Date())}>今天</Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-4 w-4' /></Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-4 w-4' /></Button>
          </div>
        </div>

        <div className='grid grid-cols-7 gap-3 py-4'>
          {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
          {days.map((day, idx) => {
            const dateKey = fmt(day, 'yyyy-MM-dd')
            const dayRecords = recordsByDate.get(dateKey) || []
            const isCurrentDay = isToday(day)
            const b = blobs[idx]
            return (
              <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex flex-col items-center justify-center p-3 transition-all duration-300 hover:scale-105', isCurrentDay ? 'bg-primary/15' : dayRecords.length > 0 ? 'bg-accent/20' : 'bg-muted/10 hover:bg-accent/10')} style={{ borderRadius: `${b.r1}% ${b.r2}% ${b.r3}% ${b.r4}% / ${b.r2}% ${b.r3}% ${b.r4}% ${b.r1}%` }}>
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium', isCurrentDay ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                {dayRecords.length > 0 && (
                  <div className='mt-1 flex gap-0.5'>
                    {dayRecords.slice(0, 3).map((r, rIdx) => (
                      <span key={rIdx} className={cn('h-1.5 w-1.5 rounded-full', getRecordDotColor(r))} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
