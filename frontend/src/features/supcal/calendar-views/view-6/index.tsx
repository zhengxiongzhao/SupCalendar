import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { addMonths, subMonths, format, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDate } from 'date-fns'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordColorClasses, getOccurrencesInMonth, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

interface RecordTimelineRow {
  record: CalendarRecord
  occurrenceDays: number[]
  label: string
  amount?: number
  direction?: 'income' | 'expense'
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

  const { days, firstDayOffset } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const offset = getDay(monthStart)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])

  const daysInMonth = endOfMonth(currentDate).getDate()

  const timelineRows = useMemo(() => {
    if (!recordsQuery.data) return []
    const rows: RecordTimelineRow[] = []
    const seen = new Set<string>()

    for (const record of recordsQuery.data) {
      if (seen.has(record.id)) continue
      seen.add(record.id)

      const occurrences = getOccurrencesInMonth(record, year, month)
      if (occurrences.length === 0) continue

      const occurrenceDays = occurrences.map((d) => getDate(d))
      let label = record.name
      let amount: number | undefined
      let direction: 'income' | 'expense' | undefined

      if (record.type === 'payment') {
        const p = record as PaymentRecord
        amount = p.amount
        direction = p.direction
      }

      rows.push({ record, occurrenceDays, label, amount, direction })
    }

    return rows
  }, [recordsQuery.data, year, month])

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 6 · 甘特日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              迷你日历 + 横向时间线日程视图
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
          <div className='flex gap-4'>
            <div className='w-[260px] shrink-0 space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='h-10 animate-pulse rounded-lg bg-muted/40' />
              ))}
            </div>
            <div className='flex-1 space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='h-10 animate-pulse rounded-lg bg-muted/40' />
              ))}
            </div>
          </div>
        ) : (
          <div className='flex gap-4'>
            <div className='w-[260px] shrink-0 rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
              <div className='mb-2 grid grid-cols-7 gap-0.5'>
                {WEEK_DAYS.map((day) => (
                  <div key={day} className='py-1 text-center text-[10px] font-semibold text-muted-foreground/60'>
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7 gap-0.5'>
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className='h-8' />
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
                        'flex h-8 w-full items-center justify-center rounded-md text-xs transition-all',
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground font-bold'
                          : isWeekendDay
                            ? 'text-rose-600/70 dark:text-rose-400/60 hover:bg-accent/50'
                            : 'text-foreground/70 hover:bg-accent/50',
                        dayRecords.length > 0 && !isCurrentDay && 'font-medium',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                      )}
                    >
                      <span className='relative'>
                        {format(day, 'd')}
                        {dayRecords.length > 0 && (
                          <span className='absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary' />
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='min-w-0 flex-1 rounded-xl border border-border/40 bg-card shadow-sm'>
              <div className='grid border-b border-border/30 px-2' style={{ gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(20px, 1fr))` }}>
                <div className='flex items-center px-2 py-2 text-[10px] font-semibold text-muted-foreground'>
                  记录名称
                </div>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const dayDate = new Date(year, month, dayNum)
                  const isCurrentDay = isToday(dayDate)
                  const isWeekendDay = isWeekend(dayDate)
                  return (
                    <div
                      key={`header-${dayNum}`}
                      className={cn(
                        'flex items-center justify-center py-2 text-[9px] font-medium',
                        isCurrentDay
                          ? 'text-primary font-bold'
                          : isWeekendDay
                            ? 'text-rose-500/60'
                            : 'text-muted-foreground/60'
                      )}
                    >
                      {dayNum}
                    </div>
                  )
                })}
              </div>

              {timelineRows.length === 0 ? (
                <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
                  本月暂无日程记录
                </div>
              ) : (
                <div className='divide-y divide-border/20'>
                  {timelineRows.map((row) => {
                    const colors = getRecordColorClasses(row.record)
                    const barDays = new Set(row.occurrenceDays)

                    return (
                      <div
                        key={row.record.id}
                        className='grid px-2 transition-colors hover:bg-accent/20'
                        style={{ gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(20px, 1fr))` }}
                      >
                        <div className='flex items-center gap-1.5 truncate px-2 py-2'>
                          <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} />
                          <span className='truncate text-xs font-medium text-foreground/80' title={row.label}>
                            {row.label}
                          </span>
                          {row.amount !== undefined && (
                            <span className={cn('shrink-0 text-[10px] font-semibold', colors.text)}>
                              {row.direction === 'income' ? '+' : '-'}
                              {formatAmount(row.amount, 'CNY')}
                            </span>
                          )}
                        </div>

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1
                          const hasBar = barDays.has(dayNum)
                          const dayDate = new Date(year, month, dayNum)
                          const isCurrentDay = isToday(dayDate)

                          return (
                            <div
                              key={`cell-${dayNum}`}
                              className={cn(
                                'flex items-center justify-center py-2',
                                isCurrentDay && 'bg-primary/5'
                              )}
                            >
                              {hasBar && (
                                <button
                                  onClick={() => handleDayClick(dayDate)}
                                  className={cn(
                                    'h-5 w-5 rounded-md transition-all hover:scale-125 hover:shadow-md',
                                    colors.bg,
                                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                                  )}
                                  title={`${row.label}${row.amount !== undefined ? ` ${row.direction === 'income' ? '+' : '-'}${formatAmount(row.amount, 'CNY')}` : ''}`}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
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
