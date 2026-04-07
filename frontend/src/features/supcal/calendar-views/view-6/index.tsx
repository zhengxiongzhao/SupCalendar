import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown, Columns3 } from 'lucide-react'
import { addMonths, subMonths, format, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns'
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

interface WeekData {
  weekStart: Date
  weekEnd: Date
  weekLabel: string
  weekDays: Date[]
  records: Array<{ record: CalendarRecord; date: Date }>
  isCurrentWeek: boolean
}

export function CalendarView6() {
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

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const allDays = eachDayOfInterval({ start: calStart, end: calEnd })
    const weekGroups: WeekData[] = []

    for (let i = 0; i < allDays.length; i += 7) {
      const weekSlice = allDays.slice(i, i + 7)
      if (weekSlice.length === 0) continue

      const weekStart = weekSlice[0]
      const weekEnd = weekSlice[weekSlice.length - 1]
      const weekDays = weekSlice.filter((d) => isSameMonth(d, currentDate))

      const weekRecords: Array<{ record: CalendarRecord; date: Date }> = []
      for (const day of weekDays) {
        const key = fmt(day, 'yyyy-MM-dd')
        const dayRecs = recordsByDate.get(key) || []
        for (const r of dayRecs) {
          weekRecords.push({ record: r, date: day })
        }
      }

      weekGroups.push({
        weekStart,
        weekEnd,
        weekLabel: `${format(weekDays[0] || weekStart, 'M/d')}-${format(weekDays[weekDays.length - 1] || weekEnd, 'M/d')}`,
        weekDays,
        records: weekRecords,
        isCurrentWeek: weekSlice.some((d) => isToday(d)),
      })
    }

    return weekGroups
  }, [currentDate, recordsByDate])

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate || !recordsQuery.data) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsQuery.data, recordsByDate])

  function handleCardClick(date: Date) {
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 6 · 看板日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              按周分列的看板式日程视图
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

        <div className='mb-4 flex items-center gap-4 rounded-lg border border-border/40 bg-card px-4 py-2.5 shadow-sm'>
          <div className='flex items-center gap-1.5'>
            <TrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
            <span className='text-[10px] text-muted-foreground'>收入</span>
            <span className='text-xs font-semibold text-emerald-700 dark:text-emerald-400'>{formatAmount(monthSummary.income, 'CNY')}</span>
          </div>
          <div className='h-3 w-px bg-border' />
          <div className='flex items-center gap-1.5'>
            <TrendingDown className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
            <span className='text-[10px] text-muted-foreground'>支出</span>
            <span className='text-xs font-semibold text-rose-700 dark:text-rose-400'>{formatAmount(monthSummary.expense, 'CNY')}</span>
          </div>
          <div className='h-3 w-px bg-border' />
          <div className='flex items-center gap-1.5'>
            <Columns3 className='h-3.5 w-3.5 text-primary' />
            <span className='text-[10px] text-muted-foreground'>共 {weeks.reduce((sum, w) => sum + w.records.length, 0)} 条</span>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='flex gap-3 overflow-x-auto pb-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='min-w-[260px] shrink-0 rounded-xl border bg-card p-3 shadow-sm'>
                <div className='mb-3 h-6 animate-pulse rounded bg-muted/30' />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className='mb-2 h-16 animate-pulse rounded-lg bg-muted/20' />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className='flex gap-3 overflow-x-auto pb-4'>
            {weeks.map((week) => (
              <div
                key={week.weekLabel}
                className={cn(
                  'min-w-[260px] max-w-[300px] shrink-0 rounded-xl border shadow-sm transition-all',
                  week.isCurrentWeek
                    ? 'border-primary/30 bg-primary/[0.02]'
                    : 'border-border/40 bg-card'
                )}
              >
                <div className={cn(
                  'flex items-center justify-between border-b px-3 py-2.5',
                  week.isCurrentWeek ? 'border-primary/20' : 'border-border/30'
                )}>
                  <div>
                    <span className='text-xs font-semibold text-foreground/80'>{week.weekLabel}</span>
                    {week.isCurrentWeek && (
                      <Badge variant='secondary' className='ml-1.5 h-4 px-1 text-[8px]'>本周</Badge>
                    )}
                  </div>
                  <div className='flex gap-0.5'>
                    {week.weekDays.slice(0, 7).map((day) => {
                      const key = fmt(day, 'yyyy-MM-dd')
                      const hasRecords = (recordsByDate.get(key) || []).length > 0
                      return (
                        <span
                          key={key}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            isToday(day) ? 'bg-primary' : hasRecords ? 'bg-emerald-400' : 'bg-muted/30'
                          )}
                        />
                      )
                    })}
                  </div>
                </div>

                <div className='space-y-2 p-3'>
                  {week.records.length === 0 ? (
                    <div className='flex h-20 items-center justify-center text-xs text-muted-foreground/40'>
                      暂无日程
                    </div>
                  ) : (
                    week.records.map((item, idx) => {
                      const colors = getRecordColorClasses(item.record)
                      const isPayment = item.record.type === 'payment'
                      const payment = isPayment ? (item.record as PaymentRecord) : null

                      return (
                        <button
                          key={`${item.record.id}-${idx}`}
                          onClick={() => handleCardClick(item.date)}
                          className={cn(
                            'flex w-full flex-col gap-1 rounded-lg border-l-3 bg-card p-2.5 text-left transition-all',
                            colors.ring,
                            'hover:-translate-y-0.5 hover:shadow-md',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                          )}
                        >
                          <div className='flex items-center justify-between'>
                            <span className='truncate text-xs font-medium text-foreground/80'>{item.record.name}</span>
                            <Badge variant='outline' className={cn('shrink-0 px-1 text-[8px]', colors.bg, colors.text)}>
                              {payment?.direction === 'income' ? '收入' : payment?.direction === 'expense' ? '支出' : '提醒'}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-[10px] text-muted-foreground'>
                              {format(item.date, 'M/d')}
                            </span>
                            {payment && (
                              <span className={cn('text-[10px] font-semibold', colors.text)}>
                                {payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
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
