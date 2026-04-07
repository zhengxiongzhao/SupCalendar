import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet } from 'lucide-react'
import { addMonths, subMonths, format, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
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
import type { CalendarRecord } from '../../types'

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView1() {
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

  const monthSummary = useMemo(() => {
    const allRecords: CalendarRecord[] = []
    recordsByDate.forEach((records) => allRecords.push(...records))
    return getFinancialSummary(allRecords)
  }, [recordsByDate])

  const { days, firstDayOffset } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const offset = getDay(monthStart)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate || !recordsQuery.data) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsQuery.data, recordsByDate])

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 1 · 热力图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              可视化你的收付款热力分布
            </p>
          </div>
        </div>

        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
              <CalendarDays className='h-4 w-4 text-primary' />
            </div>
            <h2 className='text-lg font-semibold tracking-tight'>
              {format(currentDate, 'yyyy年M月', { locale: zhCN })}
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

        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div className='flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2'>
            <Wallet className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            <div>
              <p className='text-[10px] text-muted-foreground'>本月收入</p>
              <p className='text-sm font-semibold text-emerald-700 dark:text-emerald-400'>
                {formatAmount(monthSummary.income, 'CNY')}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2'>
            <Wallet className='h-4 w-4 text-rose-600 dark:text-rose-400' />
            <div>
              <p className='text-[10px] text-muted-foreground'>本月支出</p>
              <p className='text-sm font-semibold text-rose-700 dark:text-rose-400'>
                {formatAmount(monthSummary.expense, 'CNY')}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
            <Wallet className='h-4 w-4 text-primary' />
            <div>
              <p className='text-[10px] text-muted-foreground'>本月结余</p>
              <p className={cn(
                'text-sm font-semibold',
                monthSummary.balance >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              )}>
                {monthSummary.balance >= 0 ? '+' : ''}
                {formatAmount(Math.abs(monthSummary.balance), 'CNY')}
              </p>
            </div>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='overflow-hidden rounded-2xl border border-border/40 bg-card p-3 shadow-sm'>
            <div className='grid grid-cols-7 gap-2'>
              {WEEK_DAYS.map((day) => (
                <div key={day} className='py-2 text-center text-[11px] font-semibold text-muted-foreground/50'>{day}</div>
              ))}
            </div>
            <div className='grid grid-cols-7 gap-2'>
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={`skel-${i}`} className='flex min-h-[90px] flex-col items-center gap-2 rounded-lg bg-muted/20 p-2'>
                  <div className='h-6 w-6 animate-pulse rounded-full bg-muted/40' />
                  <div className='h-2 w-full animate-pulse rounded bg-muted/30' />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-border/40 bg-card p-3 shadow-sm'>
            <div className='grid grid-cols-7 gap-2 mb-1'>
              {WEEK_DAYS.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    'py-2 text-center text-[11px] font-semibold tracking-wider',
                    idx === 0 || idx === 6
                      ? 'text-rose-500/60 dark:text-rose-400/50'
                      : 'text-muted-foreground/50'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className='grid grid-cols-7 gap-1.5'>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className='min-h-[90px] rounded-lg bg-transparent' />
              ))}

              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const dayRecords = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                const isWeekendDay = isWeekend(day)
                const { income, expense } = getFinancialSummary(dayRecords)
                const total = income + expense
                const maxBarWidth = total > 0 ? Math.min(100, Math.max(8, (total / Math.max(monthSummary.income + monthSummary.expense, 1)) * 100)) : 0
                const incomeWidth = total > 0 ? (income / total) * maxBarWidth : 0
                const expenseWidth = total > 0 ? (expense / total) * maxBarWidth : 0

                return (
                  <TooltipProvider key={dateKey} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleDayClick(day)}
                          className={cn(
                            'group flex min-h-[90px] flex-col items-center rounded-xl p-2 transition-all duration-200',
                            'hover:bg-accent/30',
                            isCurrentDay && 'ring-2 ring-primary/40 bg-primary/5',
                            isWeekendDay && !isCurrentDay && 'bg-muted/5',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                          )}
                        >
                          <div className='flex items-center justify-between w-full'>
                            <span
                              className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                                isCurrentDay
                                  ? 'bg-primary text-primary-foreground font-bold'
                                  : isWeekendDay
                                    ? 'text-rose-500/70'
                                    : 'text-foreground/60'
                              )}
                            >
                              {format(day, 'd')}
                            </span>
                            {dayRecords.length > 0 && (
                              <span className='text-[9px] font-medium tabular-nums text-muted-foreground'>
                                {dayRecords.length}笔
                              </span>
                            )}
                          </div>

                          <div className='mt-auto w-full px-0.5'>
                            {total > 0 ? (
                              <div className='flex h-3 w-full overflow-hidden rounded-full bg-muted/30'>
                                {income > 0 && (
                                  <div
                                    className='h-full rounded-l-full bg-gradient-to-r from-emerald-400 to-emerald-500'
                                    style={{ width: `${incomeWidth}%` }}
                                  />
                                )}
                                {expense > 0 && (
                                  <div
                                    className='h-full rounded-r-full bg-gradient-to-r from-rose-400 to-rose-500'
                                    style={{ width: `${expenseWidth}%` }}
                                  />
                                )}
                              </div>
                            ) : (
                              <div className='h-3 w-full rounded-full bg-muted/15' />
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='text-xs font-semibold'>{format(day, 'M月d日 EEEE', { locale: zhCN })}</p>
                        {total > 0 ? (
                          <div className='mt-1 space-y-1'>
                            {income > 0 && (
                              <p className='text-[11px] text-emerald-600'>收入: {formatAmount(income, 'CNY')}</p>
                            )}
                            {expense > 0 && (
                              <p className='text-[11px] text-rose-600'>支出: {formatAmount(expense, 'CNY')}</p>
                            )}
                          </div>
                        ) : (
                          <p className='mt-1 text-[11px] text-muted-foreground'>暂无记录</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>

            <div className='mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
                <span>收入</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
                <span>支出</span>
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