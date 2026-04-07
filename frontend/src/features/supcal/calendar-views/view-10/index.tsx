import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet, TrendingUp, TrendingDown, Bell, Clock, CheckCircle2 } from 'lucide-react'
import { addMonths, subMonths, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, differenceInDays, isBefore } from 'date-fns'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordColorClasses, getRecordDotColor, getOccurrencesInMonth, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { UrgencyBadge } from '../../components/urgency-badge'
import { getUrgencyLevel } from '../../lib/urgency'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

interface UpcomingRecord {
  record: CalendarRecord
  nextDate: Date
  daysAway: number
  isPast: boolean
}

function getUrgencyDotClass(level: string): string {
  switch (level) {
    case 'overdue':
      return 'bg-red-500'
    case 'urgent':
      return 'bg-amber-500'
    case 'soon':
      return 'bg-blue-500'
    default:
      return 'bg-emerald-500'
  }
}

export function CalendarView10() {
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

  const upcomingRecords = useMemo(() => {
    if (!recordsQuery.data) return []
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const items: UpcomingRecord[] = []
    const seen = new Set<string>()

    for (const record of recordsQuery.data) {
      const occurrences = getOccurrencesInMonth(record, year, month)
      for (const occ of occurrences) {
        const occDate = new Date(occ.getFullYear(), occ.getMonth(), occ.getDate())
        const diff = differenceInDays(occDate, now)
        const key = `${record.id}-${fmt(occDate, 'yyyy-MM-dd')}`
        if (!seen.has(key)) {
          seen.add(key)
          items.push({
            record,
            nextDate: occDate,
            daysAway: diff,
            isPast: isBefore(occDate, now) && !isToday(occDate),
          })
        }
      }
    }

    items.sort((a, b) => {
      if (a.isPast !== b.isPast) return a.isPast ? 1 : -1
      return Math.abs(a.daysAway) - Math.abs(b.daysAway)
    })

    return items.slice(0, 15)
  }, [recordsQuery.data, year, month, currentDate])

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 10 · 日程提醒</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              月历网格 + 即将到来的日程提醒面板
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

        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div className='flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2'>
            <TrendingUp className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            <div>
              <p className='text-[10px] text-muted-foreground'>本月收入</p>
              <p className='text-sm font-semibold text-emerald-700 dark:text-emerald-400'>{formatAmount(monthSummary.income, 'CNY')}</p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2'>
            <TrendingDown className='h-4 w-4 text-rose-600 dark:text-rose-400' />
            <div>
              <p className='text-[10px] text-muted-foreground'>本月支出</p>
              <p className='text-sm font-semibold text-rose-700 dark:text-rose-400'>{formatAmount(monthSummary.expense, 'CNY')}</p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
            <Wallet className='h-4 w-4 text-primary' />
            <div>
              <p className='text-[10px] text-muted-foreground'>本月结余</p>
              <p className={cn(
                'text-sm font-semibold',
                monthSummary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              )}>
                {monthSummary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(monthSummary.balance), 'CNY')}
              </p>
            </div>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-7 gap-1.5'>
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className='aspect-square animate-pulse rounded-xl bg-muted/30' />
              ))}
            </div>
            <div className='h-64 animate-pulse rounded-xl bg-muted/20' />
          </div>
        ) : (
          <>
            <div className='mb-4 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
              <div className='grid grid-cols-7 gap-px bg-muted/30 px-2 pt-3 pb-1'>
                {WEEK_DAYS.map((day, idx) => (
                  <div
                    key={day}
                    className={cn(
                      'py-2 text-center text-[10px] font-semibold tracking-wider',
                      idx === 0 || idx === 6 ? 'text-rose-500/60 dark:text-rose-400/50' : 'text-muted-foreground/60'
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7 gap-1.5 p-2'>
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className='aspect-square rounded-xl bg-muted/5' />
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
                        'group relative flex aspect-square flex-col items-center justify-center rounded-xl transition-all duration-200',
                        isCurrentDay
                          ? 'bg-primary/10 ring-2 ring-primary/30'
                          : isWeekendDay
                            ? 'bg-rose-500/5 hover:bg-rose-500/10'
                            : 'hover:bg-accent/40',
                        dayRecords.length > 0 && !isCurrentDay && 'bg-accent/20',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      )}
                    >
                      <span className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                          : isWeekendDay
                            ? 'text-rose-600/70 dark:text-rose-400/60'
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

            <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
              <div className='flex items-center justify-between border-b border-border/30 px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <Bell className='h-4 w-4 text-primary' />
                  <h3 className='text-sm font-semibold'>即将到来</h3>
                </div>
                <Badge variant='secondary' className='text-[10px]'>
                  {upcomingRecords.length} 条记录
                </Badge>
              </div>

              {upcomingRecords.length === 0 ? (
                <div className='flex h-24 items-center justify-center text-sm text-muted-foreground/50'>
                  本月暂无日程安排
                </div>
              ) : (
                <div className='max-h-[400px] divide-y divide-border/20 overflow-y-auto'>
                  {upcomingRecords.map((item, idx) => {
                    const colors = getRecordColorClasses(item.record)
                    const urgencyLevel = getUrgencyLevel(item.daysAway)
                    const urgencyDot = getUrgencyDotClass(urgencyLevel)
                    const isPayment = item.record.type === 'payment'
                    const payment = isPayment ? (item.record as PaymentRecord) : null

                    return (
                      <div
                        key={`${item.record.id}-${idx}`}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/20',
                          item.isPast && 'opacity-50'
                        )}
                      >
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', urgencyDot)} />

                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='truncate text-sm font-medium text-foreground/80'>{item.record.name}</span>
                            <Badge variant='outline' className={cn('shrink-0 px-1 text-[8px]', colors.bg, colors.text)}>
                              {payment?.direction === 'income' ? '收入' : payment?.direction === 'expense' ? '支出' : '提醒'}
                            </Badge>
                            {item.isPast && (
                              <Badge variant='secondary' className='shrink-0 gap-0.5 text-[8px]'>
                                <CheckCircle2 className='h-2.5 w-2.5' />
                                已过
                              </Badge>
                            )}
                          </div>
                          <div className='mt-0.5 flex items-center gap-2'>
                            <span className='text-[10px] text-muted-foreground'>
                              {fmt(item.nextDate, 'M月d日', { locale: zhCN })}
                            </span>
                            {!item.isPast && (
                              <UrgencyBadge days={item.daysAway} className='text-[8px] px-1 py-0' />
                            )}
                          </div>
                        </div>

                        {payment && (
                          <span className={cn('shrink-0 text-xs font-semibold', colors.text)}>
                            {payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}
                          </span>
                        )}
                        {!isPayment && (
                          <Clock className='h-4 w-4 shrink-0 text-blue-500/40' />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
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
