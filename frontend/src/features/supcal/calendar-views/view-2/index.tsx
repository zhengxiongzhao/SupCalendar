import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordDotColor, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord } from '../../types'

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