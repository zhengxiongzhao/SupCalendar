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
import { buildRecordsByDateMap, getFinancialSummary, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView5() {
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 5 · 玻璃网格</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              玻璃拟态风格的现代月历视图
            </p>
          </div>
        </div>

        <div className='mb-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/40 px-4 py-3 shadow-lg shadow-primary/5 backdrop-blur-md dark:bg-black/20 dark:border-white/10'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm'>
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
            <div className='mx-1 h-4 w-px bg-border/50' />
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-xl'
              onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-xl'
              onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div className='group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-3 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'>
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
            <TrendingUp className='mb-1 h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            <p className='text-[10px] text-muted-foreground'>本月收入</p>
            <p className='text-sm font-bold text-emerald-700 dark:text-emerald-400'>
              {formatAmount(monthSummary.income, 'CNY')}
            </p>
          </div>
          <div className='group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-500/5 p-3 backdrop-blur-sm transition-all hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10'>
            <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
            <TrendingDown className='mb-1 h-4 w-4 text-rose-600 dark:text-rose-400' />
            <p className='text-[10px] text-muted-foreground'>本月支出</p>
            <p className='text-sm font-bold text-rose-700 dark:text-rose-400'>
              {formatAmount(monthSummary.expense, 'CNY')}
            </p>
          </div>
          <div className='group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-3 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'>
            <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
            <Wallet className='mb-1 h-4 w-4 text-primary' />
            <p className='text-[10px] text-muted-foreground'>本月结余</p>
            <p className={cn(
              'text-sm font-bold',
              monthSummary.balance >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            )}>
              {monthSummary.balance >= 0 ? '+' : ''}
              {formatAmount(Math.abs(monthSummary.balance), 'CNY')}
            </p>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='overflow-hidden rounded-3xl border border-white/20 bg-white/30 p-4 shadow-xl shadow-primary/5 backdrop-blur-md dark:bg-black/20'>
            <div className='grid grid-cols-7 gap-2'>
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={`skel-${i}`} className='aspect-square rounded-2xl bg-white/30 dark:bg-white/5'>
                  <div className='h-8 w-8 animate-pulse rounded-full bg-white/50 dark:bg-white/10' />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='overflow-hidden rounded-3xl border border-white/20 bg-white/30 p-3 shadow-xl shadow-primary/5 backdrop-blur-md dark:bg-black/20 dark:border-white/10'>
            <div className='mb-2 grid grid-cols-7 gap-1'>
              {WEEK_DAYS.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    'py-2 text-center text-[10px] font-semibold uppercase tracking-wider',
                    idx === 0 || idx === 6
                      ? 'text-rose-500/70 dark:text-rose-400/60'
                      : 'text-muted-foreground/70'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className='grid grid-cols-7 gap-1.5'>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className='aspect-square rounded-2xl bg-white/20 dark:bg-white/5'
                />
              ))}

              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const dayRecords = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                const isWeekendDay = isWeekend(day)
                const hasRecords = dayRecords.length > 0
                const incomeCount = dayRecords.filter(
                  (r) => r.type === 'payment' && (r as PaymentRecord).direction === 'income'
                ).length
                const expenseCount = dayRecords.filter(
                  (r) => r.type === 'payment' && (r as PaymentRecord).direction === 'expense'
                ).length

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'group relative flex aspect-square flex-col items-center justify-start rounded-2xl border border-white/40 p-1.5 transition-all duration-300',
                      hasRecords
                        ? 'bg-white/60 dark:bg-white/10 shadow-md shadow-primary/5'
                        : 'bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10',
                      isCurrentDay && 'border-primary/50 bg-primary/20 dark:bg-primary/20 shadow-lg shadow-primary/20',
                      isWeekendDay && !isCurrentDay && 'bg-rose-500/5 dark:bg-rose-500/10',
                      'hover:scale-105 hover:shadow-lg hover:shadow-primary/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold transition-all',
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                          : isWeekendDay
                            ? 'text-rose-600/80 dark:text-rose-400/70'
                            : 'text-foreground/70 group-hover:text-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    {hasRecords && (
                      <div className='mt-0.5 flex flex-wrap justify-center gap-0.5'>
                        {incomeCount > 0 && (
                          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white/50' />
                        )}
                        {expenseCount > 0 && (
                          <span className='h-1.5 w-1.5 rounded-full bg-rose-500 ring-1 ring-white/50' />
                        )}
                        {dayRecords.filter(r => r.type === 'simple').length > 0 && (
                          <span className='h-1.5 w-1.5 rounded-full bg-blue-500 ring-1 ring-white/50' />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
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