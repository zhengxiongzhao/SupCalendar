import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { addMonths, subMonths, format, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView5() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
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

  const selectedDayRecords = useMemo(() => {
    if (!selectedDate || !recordsQuery.data) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsQuery.data, recordsByDate])

  const monthRecordList = useMemo(() => {
    if (!recordsQuery.data) return []
    const uniqueRecords = new Map<string, CalendarRecord>()
    recordsByDate.forEach((records) => {
      for (const r of records) {
        if (!uniqueRecords.has(r.id)) uniqueRecords.set(r.id, r)
      }
    })
    return Array.from(uniqueRecords.values())
  }, [recordsQuery.data, recordsByDate])

  const recordsForSheet = useMemo(() => {
    if (!selectedDate || !recordsQuery.data) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsQuery.data, recordsByDate])


  function handleDaySelect(date: Date) {
    setSelectedDate(date)
  }

  const weekDayName = selectedDate
    ? format(selectedDate, 'EEEE', { locale: zhCN })
    : ''

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 5 · 双栏日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              左侧月历 + 右侧日程详情的双栏布局
            </p>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='flex gap-6'>
            <div className='w-[320px] shrink-0 space-y-3'>
              <div className='h-10 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-64 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-24 animate-pulse rounded-xl bg-muted/30' />
            </div>
            <div className='flex-1 space-y-3'>
              <div className='h-10 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-96 animate-pulse rounded-xl bg-muted/30' />
            </div>
          </div>
        ) : (
          <div className='flex gap-6'>
            <div className='w-[320px] shrink-0 space-y-4'>
              <div className='flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                  <CalendarDays className='h-4 w-4 text-primary' />
                  <h2 className='text-sm font-semibold'>
                    {format(currentDate, 'yyyy年M月', { locale: zhCN })}
                  </h2>
                </div>
                <div className='flex items-center gap-1'>
                  <Button variant='ghost' size='sm' className='h-7 px-2 text-[10px]' onClick={() => setCurrentDate(new Date())}>
                    今天
                  </Button>
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setCurrentDate((d) => subMonths(d, 1))}>
                    <ChevronLeft className='h-3.5 w-3.5' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setCurrentDate((d) => addMonths(d, 1))}>
                    <ChevronRight className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>

              <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
                <div className='mb-1.5 grid grid-cols-7 gap-0.5'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'py-1 text-center text-[10px] font-semibold',
                        idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-0.5'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className='h-9' />
                  ))}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecords = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const isWeekendDay = isWeekend(day)
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDaySelect(day)}
                        className={cn(
                          'relative flex h-9 w-full items-center justify-center rounded-md text-xs transition-all',
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : isCurrentDay
                              ? 'bg-primary/10 text-primary font-semibold'
                              : isWeekendDay
                                ? 'text-rose-600/70 hover:bg-accent/50'
                                : 'text-foreground/70 hover:bg-accent/50',
                          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        )}
                      >
                        {format(day, 'd')}
                        {dayRecords.length > 0 && !isSelected && (
                          <span className='absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary' />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2'>
                  <TrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  <div className='flex-1'>
                    <p className='text-[9px] text-muted-foreground'>收入</p>
                    <p className='text-xs font-semibold text-emerald-700 dark:text-emerald-400'>{formatAmount(monthSummary.income, 'CNY')}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2'>
                  <TrendingDown className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
                  <div className='flex-1'>
                    <p className='text-[9px] text-muted-foreground'>支出</p>
                    <p className='text-xs font-semibold text-rose-700 dark:text-rose-400'>{formatAmount(monthSummary.expense, 'CNY')}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
                  <Wallet className='h-3.5 w-3.5 text-primary' />
                  <div className='flex-1'>
                    <p className='text-[9px] text-muted-foreground'>结余</p>
                    <p className={cn(
                      'text-xs font-semibold',
                      monthSummary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    )}>
                      {monthSummary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(monthSummary.balance), 'CNY')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='min-w-0 flex-1'>
              <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
                <div>
                  <h3 className='text-base font-semibold'>日程安排</h3>
                  {selectedDate && (
                    <p className='text-xs text-muted-foreground'>
                      {format(selectedDate, 'yyyy年M月d日', { locale: zhCN })} {weekDayName}
                    </p>
                  )}
                </div>
                {selectedDate && selectedDayRecords.length > 0 && (
                  <Badge variant='secondary' className='text-xs'>
                    {selectedDayRecords.length} 条记录
                  </Badge>
                )}
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

              <div className='mt-6'>
                <h4 className='mb-3 text-sm font-semibold text-muted-foreground'>本月全部记录</h4>
                {monthRecordList.length === 0 ? (
                  <p className='text-xs text-muted-foreground/60'>本月暂无记录</p>
                ) : (
                  <div className='space-y-1.5'>
                    {monthRecordList.map((record) => {
                      const colors = getRecordColorClasses(record)
                      const isPayment = record.type === 'payment'
                      const payment = isPayment ? (record as PaymentRecord) : null

                      return (
                        <div
                          key={record.id}
                          className='flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs'
                        >
                          <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} />
                          <span className='truncate font-medium text-foreground/80'>{record.name}</span>
                          {payment && (
                            <span className={cn('ml-auto shrink-0 font-semibold', colors.text)}>
                              {payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}
                            </span>
                          )}
                          {!isPayment && (
                            <span className='ml-auto text-muted-foreground'>
                              <Clock className='h-3 w-3' />
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Main>

      <DayDetailSheet
        date={selectedDate}
        records={recordsForSheet}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
