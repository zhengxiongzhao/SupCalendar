import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown } from 'lucide-react'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordDotColor, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord } from '../../types'

export function CalendarView25() {
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
  const allMonthRecords = useMemo(() => {
    const all: CalendarRecord[] = []
    recordsByDate.forEach(recs => all.push(...recs))
    return all
  }, [recordsByDate])
  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 25 · 棱镜统计</h1>
            <p className='mt-1 text-sm text-muted-foreground'>三棱镜分色统计面板</p>
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

        <div className='mb-4 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
          <div className='flex overflow-x-auto px-3 py-2 gap-1'>
            {days.map((day) => {
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              return (
                <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex shrink-0 flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all min-w-[40px]', isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30', !isCurrentDay && dayRecords.length > 0 && 'bg-accent/30', !isCurrentDay && dayRecords.length === 0 && 'hover:bg-accent/20')}>
                  <span className='text-[9px] text-muted-foreground/60'>{fmt(day, 'EEE', { locale: zhCN })}</span>
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium', isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                  {dayRecords.length > 0 && (
                    <div className='flex gap-0.5 mt-0.5'>
                      {dayRecords.slice(0, 2).map((r, idx) => (
                        <span key={idx} className={cn('h-1 w-1 rounded-full', getRecordDotColor(r))} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <div className='rounded-2xl border-l-4 border-l-emerald-500 border border-border/40 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 shadow-sm'>
            <div className='flex items-center gap-2 mb-3'>
              <TrendingUp className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              <h3 className='text-sm font-semibold text-emerald-700 dark:text-emerald-400'>收入面板</h3>
            </div>
            <p className='text-xl font-bold text-emerald-700 dark:text-emerald-400'>{formatAmount(summary.income, 'CNY')}</p>
            <div className='mt-3 h-2 rounded-full bg-muted/50 overflow-hidden'>
              <div className='h-full rounded-full bg-emerald-500' style={{ width: `${summary.income + summary.expense > 0 ? (summary.income / (summary.income + summary.expense)) * 100 : 0}%` }} />
            </div>
          </div>
          <div className='rounded-2xl border border-border/40 bg-card p-3 shadow-sm'>
            <div className='grid grid-cols-7 gap-1'>
              {['日','一','二','三','四','五','六'].map((d, i) => (
                <div key={d} className={cn('py-1 text-center text-[9px] font-semibold', i === 0 || i === 6 ? 'text-rose-500/60' : 'text-muted-foreground/50')}>{d}</div>
              ))}
              {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} className='aspect-square rounded bg-muted/5' />)}
              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const recs = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                return (
                  <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex aspect-square items-center justify-center rounded text-[10px] transition-colors', isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : recs.length > 0 ? 'bg-accent/30' : 'hover:bg-accent/20')}>
                    {fmt(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>
          <div className='rounded-2xl border-l-4 border-l-rose-500 border border-border/40 bg-gradient-to-br from-rose-500/5 to-transparent p-4 shadow-sm'>
            <div className='flex items-center gap-2 mb-3'>
              <TrendingDown className='h-4 w-4 text-rose-600 dark:text-rose-400' />
              <h3 className='text-sm font-semibold text-rose-700 dark:text-rose-400'>支出面板</h3>
            </div>
            <p className='text-xl font-bold text-rose-700 dark:text-rose-400'>{formatAmount(summary.expense, 'CNY')}</p>
            <div className='mt-3 h-2 rounded-full bg-muted/50 overflow-hidden'>
              <div className='h-full rounded-full bg-rose-500' style={{ width: `${summary.income + summary.expense > 0 ? (summary.expense / (summary.income + summary.expense)) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
