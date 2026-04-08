import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordDotColor, format as fmt , getRecordColorClasses } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord , PaymentRecord } from '../../types'

export function CalendarView2() {
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 2 · 卡片网格</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              卡片式月历网格，每一天都是独立卡片
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
            <Button
              variant='ghost'
              size='sm'
              className='h-8 text-xs font-medium'
              onClick={() => setCurrentDate(new Date())}
            >
              今天
            </Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-lg'
              onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-lg'
              onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div className='flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2'>
            <TrendingUp className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            <div>
              <p className='text-[10px] text-muted-foreground'>本月收入</p>
              <p className='text-sm font-semibold text-emerald-700 dark:text-emerald-400'>
                {formatAmount(monthSummary.income, 'CNY')}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2'>
            <TrendingDown className='h-4 w-4 text-rose-600 dark:text-rose-400' />
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
          <div className='grid grid-cols-7 gap-2'>
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={`skel-${i}`} className='aspect-square rounded-2xl border bg-card p-3 shadow-sm'>
                <div className='h-8 w-8 animate-pulse rounded-full bg-muted/60' />
              </div>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-7 gap-2'>
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className='aspect-square rounded-2xl bg-transparent'
              />
            ))}

            {days.map((day) => {
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              const isWeekendDay = isWeekend(day)

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'group relative flex aspect-square flex-col items-center justify-start rounded-2xl border-2 p-2 transition-all duration-200',
                    isCurrentDay
                      ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10'
                      : isWeekendDay
                        ? 'border-rose-200/50 bg-rose-50/30 dark:border-rose-800/30 dark:bg-rose-950/10'
                        : 'border-border/30 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-transform',
                    isCurrentDay
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-110'
                      : 'text-foreground/80 group-hover:scale-105'
                  )}>
                    {format(day, 'd')}
                  </div>

                  <div className='mt-1 flex flex-wrap justify-center gap-1'>
                    {dayRecords.slice(0, 4).map((record, idx) => (
                      <span
                        key={`${record.id}-${idx}`}
                        className={cn(
                          'h-2 w-2 rounded-full',
                          getRecordDotColor(record)
                        )}
                      />
                    ))}
                  </div>

                  {dayRecords.length > 0 && (
                    <div className='absolute -bottom-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm'>
                      {dayRecords.length}
                    </div>
                  )}
                </button>
              )
            })}
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