import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown, CalendarDays, Activity, PieChart, Hash } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay , isSameDay } from 'date-fns'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordDotColor, format as fmt , getRecordColorClasses } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView9() {
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

  const stats = useMemo(() => {
    let incomeCount = 0
    let expenseCount = 0
    let reminderCount = 0
    let totalDaysWithRecords = 0

    recordsByDate.forEach((records) => {
      totalDaysWithRecords++
      for (const r of records) {
        if (r.type === 'payment') {
          const p = r as PaymentRecord
          if (p.direction === 'income') incomeCount++
          else expenseCount++
        } else {
          reminderCount++
        }
      }
    })

    return { incomeCount, expenseCount, reminderCount, totalDaysWithRecords }
  }, [recordsByDate])


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
    if (!selectedDate) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsByDate])


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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 9 · 迷你仪表盘</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              统计卡片 + 紧凑月历概览
            </p>
          </div>
        </div>

        {/* Month navigation */}
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

        {/* Stats cards - 2x2 grid */}
        <div className='mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10'>
                <TrendingUp className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div>
                <p className='text-[10px] text-muted-foreground'>收入</p>
                <p className='text-sm font-bold text-emerald-700 dark:text-emerald-400'>{formatAmount(summary.income, 'CNY')}</p>
              </div>
            </div>
            <p className='mt-1.5 text-[10px] text-muted-foreground/60'>{stats.incomeCount} 笔收入记录</p>
          </div>
          <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10'>
                <TrendingDown className='h-4 w-4 text-rose-600 dark:text-rose-400' />
              </div>
              <div>
                <p className='text-[10px] text-muted-foreground'>支出</p>
                <p className='text-sm font-bold text-rose-700 dark:text-rose-400'>{formatAmount(summary.expense, 'CNY')}</p>
              </div>
            </div>
            <p className='mt-1.5 text-[10px] text-muted-foreground/60'>{stats.expenseCount} 笔支出记录</p>
          </div>
          <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                <Wallet className='h-4 w-4 text-primary' />
              </div>
              <div>
                <p className='text-[10px] text-muted-foreground'>结余</p>
                <p className={cn('text-sm font-bold', summary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
                  {summary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(summary.balance), 'CNY')}
                </p>
              </div>
            </div>
            <p className='mt-1.5 text-[10px] text-muted-foreground/60'>净收支差额</p>
          </div>
          <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10'>
                <Activity className='h-4 w-4 text-amber-600 dark:text-amber-400' />
              </div>
              <div>
                <p className='text-[10px] text-muted-foreground'>活跃天数</p>
                <p className='text-sm font-bold text-foreground/80'>{stats.totalDaysWithRecords} 天</p>
              </div>
            </div>
            <div className='mt-1.5 flex items-center gap-1.5'>
              <Hash className='h-3 w-3 text-muted-foreground/40' />
              <span className='text-[10px] text-muted-foreground/60'>{stats.reminderCount} 个提醒</span>
            </div>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='grid grid-cols-7 gap-1'>
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className='aspect-square animate-pulse rounded-lg bg-muted/30' />
            ))}
          </div>
        ) : (
          /* Mini bar chart + calendar */
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            {/* Calendar grid */}
            <div className='lg:col-span-2'>
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
                <div className='grid grid-cols-7 gap-1 p-3'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square rounded-lg bg-muted/5' />
                  ))}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecords = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)

                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'group relative flex aspect-square flex-col items-center justify-center rounded-lg transition-all duration-200',
                          isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30',
                          !isCurrentDay && dayRecords.length > 0 && 'bg-accent/30',
                          !isCurrentDay && dayRecords.length === 0 && 'hover:bg-accent/20',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <span className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                          isCurrentDay
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'text-foreground/70'
                        )}>
                          {fmt(day, 'd')}
                        </span>
                        {dayRecords.length > 0 && (
                          <div className='mt-0.5 flex gap-0.5'>
                            {dayRecords.slice(0, 3).map((record, idx) => (
                              <span key={`${record.id}-${idx}`} className={cn('h-1 w-1 rounded-full', getRecordDotColor(record))} />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Side panel - proportion chart */}
            <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
              <div className='flex items-center gap-2 mb-4'>
                <PieChart className='h-4 w-4 text-primary' />
                <h3 className='text-sm font-semibold'>本月构成</h3>
              </div>

              {allMonthRecords.length === 0 ? (
                <div className='flex h-32 items-center justify-center text-sm text-muted-foreground/50'>
                  暂无数据
                </div>
              ) : (
                <div className='space-y-3'>
                  {/* Income bar */}
                  <div>
                    <div className='flex items-center justify-between text-[11px] mb-1'>
                      <span className='text-muted-foreground'>收入</span>
                      <span className='font-medium text-emerald-700 dark:text-emerald-400'>{stats.incomeCount} 笔</span>
                    </div>
                    <div className='h-2 rounded-full bg-muted/50 overflow-hidden'>
                      <div
                        className='h-full rounded-full bg-emerald-500 transition-all duration-500'
                        style={{ width: `${allMonthRecords.length > 0 ? (stats.incomeCount / allMonthRecords.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Expense bar */}
                  <div>
                    <div className='flex items-center justify-between text-[11px] mb-1'>
                      <span className='text-muted-foreground'>支出</span>
                      <span className='font-medium text-rose-700 dark:text-rose-400'>{stats.expenseCount} 笔</span>
                    </div>
                    <div className='h-2 rounded-full bg-muted/50 overflow-hidden'>
                      <div
                        className='h-full rounded-full bg-rose-500 transition-all duration-500'
                        style={{ width: `${allMonthRecords.length > 0 ? (stats.expenseCount / allMonthRecords.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Reminder bar */}
                  <div>
                    <div className='flex items-center justify-between text-[11px] mb-1'>
                      <span className='text-muted-foreground'>提醒</span>
                      <span className='font-medium text-blue-700 dark:text-blue-400'>{stats.reminderCount} 个</span>
                    </div>
                    <div className='h-2 rounded-full bg-muted/50 overflow-hidden'>
                      <div
                        className='h-full rounded-full bg-blue-500 transition-all duration-500'
                        style={{ width: `${allMonthRecords.length > 0 ? (stats.reminderCount / allMonthRecords.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className='mt-4 border-t border-border/30 pt-3'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-muted-foreground'>总记录数</span>
                      <span className='font-bold text-foreground/80'>{allMonthRecords.length}</span>
                    </div>
                  </div>
                </div>
              )}
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
