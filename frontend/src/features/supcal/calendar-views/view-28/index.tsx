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

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView28() {
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
    recordsByDate.forEach(r => all.push(...r))
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 28 · 棋盘视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>交替明暗棋盘格 + 财务侧栏</p>
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

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <div className='lg:col-span-2 rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden'>
            <div className='grid grid-cols-7 gap-0'>
              {WEEK_DAYS.map((day, idx) => (
                <div key={day} className={cn('py-2 text-center text-[10px] font-semibold tracking-wider', idx % 2 === 0 ? 'bg-muted/20' : 'bg-card', idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60')}>{day}</div>
              ))}
            </div>
            <div className='grid grid-cols-7 gap-0'>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`e-${i}`} className={cn('aspect-square', i % 2 === 0 ? 'bg-muted/10' : 'bg-card')} />
              ))}
              {days.map((day, idx) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const dayRecords = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                const cellIdx = firstDayOffset + idx
                const isDark = cellIdx % 2 === 0
                return (
                  <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex aspect-square flex-col items-center justify-center transition-all duration-200 border border-border/5', isDark ? 'bg-muted/15' : 'bg-card', isCurrentDay && 'ring-2 ring-primary/40 bg-primary/10', 'hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium', isCurrentDay ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                    {dayRecords.length > 0 && (
                      <div className='mt-0.5 flex gap-0.5'>
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

          <div className='space-y-3'>
            <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <TrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                <span className='text-[11px] font-semibold text-emerald-700 dark:text-emerald-400'>收入</span>
              </div>
              <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>{formatAmount(summary.income, 'CNY')}</p>
            </div>
            <div className='rounded-xl border border-rose-500/20 bg-rose-500/5 p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <TrendingDown className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
                <span className='text-[11px] font-semibold text-rose-700 dark:text-rose-400'>支出</span>
              </div>
              <p className='text-lg font-bold text-rose-700 dark:text-rose-400'>{formatAmount(summary.expense, 'CNY')}</p>
            </div>
            <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
              <h3 className='text-xs font-semibold mb-2'>本月记录分布</h3>
              <div className='h-2 rounded-full bg-muted/50 overflow-hidden flex'>
                <div className='h-full bg-emerald-500' style={{ width: `${summary.income + summary.expense > 0 ? (summary.income / (summary.income + summary.expense)) * 100 : 50}%` }} />
                <div className='h-full bg-rose-500' style={{ width: `${summary.income + summary.expense > 0 ? (summary.expense / (summary.income + summary.expense)) * 100 : 50}%` }} />
              </div>
              <div className='flex justify-between mt-1 text-[9px] text-muted-foreground/50'>
                <span>收入</span><span>支出</span>
              </div>
            </div>
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
