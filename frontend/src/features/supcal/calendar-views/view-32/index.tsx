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
import { buildRecordsByDateMap, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'

export function CalendarView32() {
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

  const rotations = [-3, 2, -1, 3, -2, 1, -3, 2, -1, 3, -2, 1, -3, 2, -1, 3, -2, 1, -3, 2, -1, 3, -2, 1, -3, 2, -1, 3, -2, 1, -3]

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 32 · 拼贴画</h1>
            <p className='mt-1 text-sm text-muted-foreground'>重叠卡片拼贴风格</p>
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

        <div className='flex flex-wrap gap-3 justify-center py-4'>
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`e-${i}`} className='w-16 h-16' />
          ))}
          {days.map((day, idx) => {
            const dateKey = fmt(day, 'yyyy-MM-dd')
            const dayRecords = recordsByDate.get(dateKey) || []
            const isCurrentDay = isToday(day)
            const rotation = rotations[idx % rotations.length]
            const scale = dayRecords.length > 0 ? 1 + dayRecords.length * 0.05 : 1
            return (
              <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('w-16 h-16 rounded-xl border p-2 transition-all duration-300 hover:scale-110 hover:z-20', isCurrentDay ? 'border-primary/50 bg-primary/10 shadow-lg' : dayRecords.length > 0 ? 'border-accent/40 bg-card shadow-md' : 'border-border/20 bg-card/50 shadow-sm')} style={{ transform: `rotate(${rotation}deg) scale(${scale})`, zIndex: isCurrentDay ? 10 : dayRecords.length > 0 ? 5 : 1 }}>
                <span className={cn('flex h-full items-center justify-center text-sm font-medium', isCurrentDay ? 'text-primary font-bold' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                {dayRecords.length > 0 && (
                  <div className='absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5'>
                    {dayRecords.slice(0, 3).map((r, rIdx) => {
                      const colors = getRecordColorClasses(r)
                      return <span key={rIdx} className={cn('h-1 w-1 rounded-full', colors.dot)} />
                    })}
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
