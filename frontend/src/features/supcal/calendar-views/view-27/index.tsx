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

export function CalendarView27() {
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

  const allDays = useMemo(() => {
    const result: (Date | null)[] = []
    for (let i = 0; i < firstDayOffset; i++) result.push(null)
    days.forEach(d => result.push(d))
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [firstDayOffset, days])

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 27 · 阶梯日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>对角阶梯式日历排列</p>
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

        <div className='overflow-x-auto pb-4'>
          <div className='grid grid-cols-7 gap-1'>
            {WEEK_DAYS.map((day, idx) => (
              <div key={day} className={cn('py-2 text-center text-[10px] font-semibold tracking-wider', idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60')}>{day}</div>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-1'>
            {allDays.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className='h-16' />
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              const colIdx = idx % 7
              const rowIdx = Math.floor(idx / 7)
              const stepUp = rowIdx * 4 + colIdx * 2
              return (
                <button key={dateKey} onClick={() => handleDayClick(day)} style={{ marginTop: `${stepUp}px` }} className={cn('rounded-xl border p-2 text-left transition-all duration-200 min-h-[60px]', isCurrentDay ? 'border-primary/40 bg-primary/5' : dayRecords.length > 0 ? 'border-accent/40 bg-accent/10' : 'border-border/20 bg-card hover:border-border/40', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium', isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground/60')}>{fmt(day, 'd')}</span>
                  {dayRecords.length > 0 && (
                    <div className='mt-1 flex flex-wrap gap-0.5'>
                      {dayRecords.slice(0, 3).map((r, rIdx) => (
                        <span key={rIdx} className={cn('h-1.5 w-1.5 rounded-full', getRecordDotColor(r))} />
                      ))}
                    </div>
                  )}
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
