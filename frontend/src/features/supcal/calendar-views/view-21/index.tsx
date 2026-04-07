import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
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
import type { PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView21() {
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 21 · 波浪日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>波浪分隔线 + 月历网格</p>
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

        <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
          <div className='grid grid-cols-7 gap-px bg-muted/30 px-3 pt-3 pb-1'>
            {WEEK_DAYS.map((day, idx) => (
              <div key={day} className={cn('py-2 text-center text-[10px] font-semibold tracking-wider', idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60')}>{day}</div>
            ))}
          </div>
          <svg className='w-full h-3 text-muted/20' viewBox='0 0 800 12' preserveAspectRatio='none'>
            <path d='M0 6 Q25 0 50 6 Q75 12 100 6 Q125 0 150 6 Q175 12 200 6 Q225 0 250 6 Q275 12 300 6 Q325 0 350 6 Q375 12 400 6 Q425 0 450 6 Q475 12 500 6 Q525 0 550 6 Q575 12 600 6 Q625 0 650 6 Q675 12 700 6 Q725 0 750 6 Q775 12 800 6' fill='none' stroke='currentColor' strokeWidth='1.5' />
          </svg>
          <div className='grid grid-cols-7 gap-1 p-3'>
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} className='aspect-square rounded-lg bg-muted/5' />)}
            {days.map((day) => {
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              return (
                <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('group relative flex aspect-square flex-col items-center justify-center rounded-lg transition-all duration-200', isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30', !isCurrentDay && dayRecords.length > 0 && 'bg-accent/30', !isCurrentDay && dayRecords.length === 0 && 'hover:bg-accent/20', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium', isCurrentDay ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                  {dayRecords.length > 0 && (
                    <div className='mt-0.5 flex gap-0.5'>
                      {dayRecords.slice(0, 3).map((r, idx) => {
                        const colors = getRecordColorClasses(r)
                        return <span key={idx} className={cn('h-1 w-1 rounded-full', colors.dot)} />
                      })}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <svg className='w-full h-4 text-primary/10' viewBox='0 0 800 16' preserveAspectRatio='none'>
            <path d='M0 8 C100 0 200 16 300 8 C400 0 500 16 600 8 C700 0 800 16 800 8 L800 16 L0 16 Z' fill='currentColor' />
          </svg>
          <div className='px-4 pb-4 space-y-2'>
            {Array.from(recordsByDate.entries()).slice(0, 5).map(([dateKey, recs]) => (
              <div key={dateKey} className='flex items-center gap-3 rounded-xl border-l-4 border-l-primary/30 bg-accent/10 px-3 py-2'>
                <span className='text-[11px] font-semibold text-muted-foreground w-16 shrink-0'>{dateKey.slice(5)}</span>
                <div className='flex gap-1 flex-wrap'>
                  {recs.slice(0, 3).map((r) => {
                    const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                    return (
                      <span key={r.id} className='flex items-center gap-1 text-[10px]'>
                        {payment?.direction === 'income' ? <ArrowUpRight className='h-3 w-3 text-emerald-500' /> : payment?.direction === 'expense' ? <ArrowDownLeft className='h-3 w-3 text-rose-500' /> : <Clock className='h-3 w-3 text-blue-500' />}
                        <span className='text-foreground/70'>{r.name}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
