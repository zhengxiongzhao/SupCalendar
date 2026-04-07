import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useRecords } from '../../api/records'
import { buildRecordsByDateMap, getRecordDotColor, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'

export function CalendarView35() {
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

  const cellSize = 44
  const gap = 2

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 35 · 晶格视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>菱形晶格连线日历</p>
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

        <div className='flex justify-center py-4'>
          <svg viewBox={`0 0 ${7 * (cellSize + gap)} ${6 * (cellSize + gap)}`} className='w-full max-w-lg'>
            {days.map((day, idx) => {
              const col = (firstDayOffset + idx) % 7
              const row = Math.floor((firstDayOffset + idx) / 7)
              const x = col * (cellSize + gap) + cellSize / 2
              const y = row * (cellSize + gap) + cellSize / 2
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              const hasRecords = dayRecords.length > 0

              const nextIdx = idx + 1
              const nextCol = (firstDayOffset + nextIdx) % 7
              const nextRow = Math.floor((firstDayOffset + nextIdx) / 7)
              const nextX = nextCol * (cellSize + gap) + cellSize / 2
              const nextY = nextRow * (cellSize + gap) + cellSize / 2
              const lineEl = nextIdx < days.length ? (
                <line key={`l-${idx}`} x1={x} y1={y} x2={nextX} y2={nextY} stroke='hsl(var(--border))' strokeWidth='1' opacity='0.3' />
              ) : null

              return (
                <g key={dateKey}>
                  {lineEl}
                  <circle cx={x} cy={y} r={cellSize / 2 - 2} fill={isCurrentDay ? 'hsl(var(--primary) / 0.2)' : hasRecords ? 'hsl(var(--accent) / 0.3)' : 'hsl(var(--card))'} stroke={isCurrentDay ? 'hsl(var(--primary))' : hasRecords ? 'hsl(var(--accent))' : 'hsl(var(--border) / 0.3)'} strokeWidth={isCurrentDay ? 2 : 1} className='cursor-pointer' onClick={() => handleDayClick(day)} />
                  <text x={x} y={y + 1} textAnchor='middle' dominantBaseline='central' className='fill-foreground/70 text-[10px] font-medium pointer-events-none' style={{ fontSize: '10px' }}>{fmt(day, 'd')}</text>
                  {hasRecords && dayRecords.slice(0, 2).map((r, rIdx) => (
                    <circle key={rIdx} cx={x - 4 + rIdx * 8} cy={y + 12} r='2' fill={getRecordDotColor(r) === 'bg-emerald-500' ? 'hsl(152 60% 40%)' : getRecordDotColor(r) === 'bg-rose-500' ? 'hsl(0 70% 50%)' : 'hsl(220 60% 50%)'} />
                  ))}
                </g>
              )
            })}
          </svg>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
