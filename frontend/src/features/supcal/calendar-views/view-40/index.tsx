import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TreePine } from 'lucide-react'
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

export function CalendarView40() {
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 40 · 森林日历</h1>
            <p className='mt-1 text-sm text-muted-foreground'>树形高度反映日程密度</p>
          </div>
        </div>
        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10'><TreePine className='h-4 w-4 text-emerald-600 dark:text-emerald-400' /></div>
            <h2 className='text-lg font-semibold tracking-tight'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button variant='ghost' size='sm' className='h-8 text-xs font-medium' onClick={() => setCurrentDate(new Date())}>今天</Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-4 w-4' /></Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-4 w-4' /></Button>
          </div>
        </div>

        <div className='rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 via-card to-card p-4 shadow-sm'>
          <div className='grid grid-cols-7 gap-2'>
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map((day) => {
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              const treeH = Math.max(20, dayRecords.length * 18 + 20)
              const trunkH = 12
              return (
                <button key={dateKey} onClick={() => handleDayClick(day)} className='flex flex-col items-center group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded'>
                  <div className={cn('rounded-t-full transition-all duration-300 flex items-center justify-center', isCurrentDay ? 'bg-emerald-500/30 ring-2 ring-emerald-500/40' : dayRecords.length > 0 ? 'bg-emerald-500/15 group-hover:bg-emerald-500/25' : 'bg-muted/10 group-hover:bg-emerald-500/10')} style={{ width: '32px', height: `${treeH - trunkH}px` }}>
                    {dayRecords.length > 0 && (
                      <div className='flex flex-col gap-0.5'>
                        {dayRecords.slice(0, 3).map((r, idx) => (
                          <span key={idx} className={cn('h-1 w-1 rounded-full', getRecordDotColor(r))} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={cn('w-[4px] rounded-b-sm', isCurrentDay ? 'bg-emerald-600/50' : 'bg-amber-700/20')} style={{ height: `${trunkH}px` }} />
                  <span className={cn('text-[9px] mt-0.5 font-medium', isCurrentDay ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-foreground/50')}>{fmt(day, 'd')}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
