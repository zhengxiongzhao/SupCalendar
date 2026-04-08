import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet } from 'lucide-react'
import { addMonths, subMonths, format, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay , isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useRecords } from '../../api/records'
import { buildRecordsByDateMap, getFinancialSummary, format as fmt , getRecordColorClasses } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord , PaymentRecord } from '../../types'

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


  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }
  function handleDaySelect(date: Date) { setSelectedDate(date) }

  const monthRecordList = useMemo(() => {
    const result: { date: Date; record: CalendarRecord }[] = []
    recordsByDate.forEach((recs, key) => {
      const d = new Date(key)
      recs.forEach((r) => result.push({ date: d, record: r }))
    })
    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [recordsByDate])

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate || !recordsQuery.data) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsQuery.data, recordsByDate])


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
      
            <div className='mt-6'>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>本月日程</h3>
                {monthRecordList.length > 0 && <Badge variant='secondary' className='text-xs'>{monthRecordList.length} 条日程</Badge>}
              </div>
              {monthRecordList.length > 0 ? (
                <div className='space-y-3 max-h-[600px] overflow-y-auto pr-1'>
                  {Array.from(recordsByDate.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([dateKey, recs]) => {
                    const date = new Date(dateKey)
                    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                    return (
                      <div key={dateKey} className={cn('rounded-lg border border-border/20 p-3 transition-all', isSelected && 'bg-primary/5 ring-1 ring-primary/20')}>
                        <div className='flex items-center gap-2 mb-2'>
                          <button onClick={() => handleDaySelect(date)} className='flex items-center gap-2 hover:bg-accent/20 rounded px-1 py-0.5 transition-colors'>
                            <span className='text-xs font-semibold'>{fmt(date, 'M月d日', { locale: zhCN })}</span>
                            <span className='text-[10px] text-muted-foreground'>{fmt(date, 'EEE', { locale: zhCN })}</span>
                          </button>
                          <Badge variant='outline' className='text-[9px] h-4 px-1.5'>{recs.length}条</Badge>
                        </div>
                        <div className='space-y-1.5'>
                          {recs.map((record) => {
                            const colors = getRecordColorClasses(record)
                            const isPayment = record.type === 'payment'
                            const payment = isPayment ? (record as PaymentRecord) : null
                            return (
                              <button key={record.id} onClick={() => { setSelectedDate(date); setSheetOpen(true) }} className={cn('flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent/20')}>
                                <div className={cn('h-2 w-2 rounded-full shrink-0', colors.dot)} />
                                <span className='truncate text-xs flex-1'>{record.name}</span>
                                {payment && <span className={cn('text-[10px] shrink-0 font-semibold', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-16 text-muted-foreground'>
                  <CalendarDays className='mb-2 h-8 w-8 text-muted-foreground/30' />
                  <p className='text-sm'>本月暂无记录</p>
                </div>
              )}
            </div>
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