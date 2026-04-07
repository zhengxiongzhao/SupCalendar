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

export function CalendarView29() {
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

  const hexClipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

  const allCells = useMemo(() => {
    const cells: (Date | null)[] = []
    for (let i = 0; i < firstDayOffset; i++) cells.push(null)
    days.forEach(d => cells.push(d))
    return cells
  }, [firstDayOffset, days])

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 29 · 蜂巢网格</h1>
            <p className='mt-1 text-sm text-muted-foreground'>六边形蜂巢排列日历</p>
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

        <div className='flex flex-col items-center gap-0 py-4'>
          {Array.from({ length: Math.ceil(allCells.length / 7) }).map((_, rowIdx) => {
            const rowStart = rowIdx * 7
            const rowCells = allCells.slice(rowStart, rowStart + 7)
            const isOddRow = rowIdx % 2 === 1
            return (
              <div key={rowIdx} className='flex' style={{ marginLeft: isOddRow ? '28px' : '0' }}>
                {rowCells.map((day, colIdx) => {
                  if (!day) return <div key={`e-${rowIdx}-${colIdx}`} className='m-[2px] h-[52px] w-[52px]' />
                  const dateKey = fmt(day, 'yyyy-MM-dd')
                  const dayRecords = recordsByDate.get(dateKey) || []
                  const isCurrentDay = isToday(day)
                  return (
                    <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('m-[2px] flex h-[52px] w-[52px] flex-col items-center justify-center transition-all duration-200', isCurrentDay ? 'bg-primary/30' : dayRecords.length > 0 ? 'bg-accent/30' : 'bg-muted/15 hover:bg-accent/20')} style={{ clipPath: hexClipPath }}>
                      <span className={cn('text-[10px] font-medium', isCurrentDay ? 'text-primary font-bold' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                      {dayRecords.length > 0 && (
                        <div className='flex gap-0.5 mt-0.5'>
                          {dayRecords.slice(0, 2).map((r, rIdx) => (
                            <span key={rIdx} className={cn('h-1 w-1 rounded-full', getRecordDotColor(r))} />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
