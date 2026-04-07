import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
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
import { buildRecordsByDateMap, getFinancialSummary, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

function getHeatColor(count: number): string {
  if (count === 0) return 'bg-muted/10 border-border/10'
  if (count === 1) return 'bg-emerald-500/10 border-emerald-500/20'
  if (count === 2) return 'bg-emerald-500/20 border-emerald-500/30'
  if (count <= 4) return 'bg-emerald-500/30 border-emerald-500/40'
  return 'bg-emerald-500/40 border-emerald-500/50'
}

export function CalendarView20() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const recordsByDate = useMemo(
    () => buildRecordsByDateMap(recordsQuery.data, year, month),
    [recordsQuery.data, year, month]
  )

  const allMonthRecords = useMemo(() => {
    const all: CalendarRecord[] = []
    recordsByDate.forEach((records) => all.push(...records))
    return all
  }, [recordsByDate])

  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])

  const { days, firstDayOffset } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const offset = getDay(monthStart)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])

  const dailyAmounts = useMemo(() => {
    const amounts = new Map<string, number>()
    recordsByDate.forEach((records, dateKey) => {
      let total = 0
      for (const r of records) {
        if (r.type === 'payment') {
          const p = r as PaymentRecord
          total += p.direction === 'expense' ? p.amount : 0
        }
      }
      amounts.set(dateKey, total)
    })
    return amounts
  }, [recordsByDate])

  const maxDailyExpense = useMemo(() => {
    let max = 0
    dailyAmounts.forEach((amount) => {
      if (amount > max) max = amount
    })
    return max
  }, [dailyAmounts])

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsByDate])

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 20 · 马赛克热图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              支出热力图 + 统计侧栏
            </p>
          </div>
        </div>

        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
              <CalendarDays className='h-4 w-4 text-primary' />
            </div>
            <h2 className='text-lg font-semibold tracking-tight'>
              {fmt(currentDate, 'yyyy年M月', { locale: zhCN })}
            </h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button variant='ghost' size='sm' className='h-8 text-xs font-medium' onClick={() => setCurrentDate(new Date())}>
              今天
            </Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate((d) => subMonths(d, 1))}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate((d) => addMonths(d, 1))}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='h-64 animate-pulse rounded-2xl bg-muted/20' />
        ) : (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
            <div className='lg:col-span-3'>
              <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
                <div className='grid grid-cols-7 gap-px bg-muted/30 px-3 pt-3 pb-1'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'py-2 text-center text-[10px] font-semibold tracking-wider',
                        idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1.5 p-3'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square rounded-lg bg-muted/5' />
                  ))}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecords = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const expense = dailyAmounts.get(dateKey) || 0
                    const hasRecords = dayRecords.length > 0
                    const barHeight = maxDailyExpense > 0 ? (expense / maxDailyExpense) * 100 : 0

                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'group relative flex aspect-square flex-col items-center justify-center rounded-lg border transition-all duration-200 overflow-hidden',
                          isCurrentDay ? 'ring-2 ring-primary/30' : '',
                          getHeatColor(dayRecords.length),
                          'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        {expense > 0 && (
                          <div
                            className='absolute bottom-0 left-0 right-0 bg-rose-500/15'
                            style={{ height: `${Math.max(barHeight, 4)}%` }}
                          />
                        )}
                        <span className={cn(
                          'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                          isCurrentDay
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'text-foreground/70'
                        )}>
                          {fmt(day, 'd')}
                        </span>
                        {hasRecords && (
                          <span className='relative z-10 text-[8px] font-medium text-muted-foreground/50'>
                            {dayRecords.length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className='flex items-center justify-center gap-3 border-t border-border/20 px-4 py-2'>
                  <span className='text-[9px] text-muted-foreground/50'>支出强度</span>
                  <div className='flex items-center gap-1'>
                    {[0, 1, 2, 4, 6].map((level) => (
                      <div
                        key={level}
                        className={cn('h-3 w-6 rounded-sm', getHeatColor(level))}
                      />
                    ))}
                  </div>
                  <span className='text-[9px] text-muted-foreground/50'>日程多</span>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
                <div className='flex items-center gap-2 mb-3'>
                  <TrendingUp className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                  <span className='text-xs font-semibold'>收入</span>
                </div>
                <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                  {formatAmount(summary.income, 'CNY')}
                </p>
              </div>

              <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
                <div className='flex items-center gap-2 mb-3'>
                  <TrendingDown className='h-4 w-4 text-rose-600 dark:text-rose-400' />
                  <span className='text-xs font-semibold'>支出</span>
                </div>
                <p className='text-lg font-bold text-rose-700 dark:text-rose-400'>
                  {formatAmount(summary.expense, 'CNY')}
                </p>
              </div>

              <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
                <div className='flex items-center gap-2 mb-3'>
                  <Wallet className='h-4 w-4 text-primary' />
                  <span className='text-xs font-semibold'>结余</span>
                </div>
                <p className={cn(
                  'text-lg font-bold',
                  summary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                )}>
                  {summary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(summary.balance), 'CNY')}
                </p>
              </div>

              <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
                <h3 className='text-xs font-semibold mb-2'>活跃天数</h3>
                <div className='flex items-baseline gap-1'>
                  <span className='text-2xl font-bold text-foreground/80'>
                    {Array.from(recordsByDate.keys()).length}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>/ {days.length} 天</span>
                </div>
                <div className='mt-2 h-1.5 rounded-full bg-muted/50 overflow-hidden'>
                  <div
                    className='h-full rounded-full bg-primary/50 transition-all duration-500'
                    style={{ width: `${(Array.from(recordsByDate.keys()).length / days.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Main>

      <DayDetailSheet
        date={selectedDate}
        records={recordsForSelectedDate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
