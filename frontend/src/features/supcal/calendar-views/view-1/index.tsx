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
import { buildRecordsByDateMap, getFinancialSummary, getRecordDotColor, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 1 · 月历网格</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              以经典月历网格查看你的收付款和提醒安排
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
          <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
            <div className='grid grid-cols-7 gap-px bg-muted/30 px-2 pt-3 pb-1'>
              {WEEK_DAYS.map((day) => (
                <div key={day} className='py-2.5 text-center text-[11px] font-semibold tracking-wider text-muted-foreground/60'>
                  {day}
                </div>
              ))}
            </div>
            <div className='grid grid-cols-7 gap-px p-2'>
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={`skel-${i}`} className='rounded-xl p-2.5'>
                  <div className='h-7 w-7 animate-pulse rounded-lg bg-muted/60' />
                  <div className='mt-2 flex gap-1'>
                    <div className='h-2.5 w-10 animate-pulse rounded-full bg-muted/40' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
            <div className='grid grid-cols-7 gap-px bg-muted/30 px-2 pt-3 pb-1'>
              {WEEK_DAYS.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    'py-2.5 text-center text-[11px] font-semibold tracking-wider',
                    idx === 0 || idx === 6
                      ? 'text-rose-500/60 dark:text-rose-400/50'
                      : 'text-muted-foreground/60'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className='grid grid-cols-7 gap-1 p-1.5'>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className='rounded-xl bg-muted/5 min-h-[80px] sm:min-h-[100px]'
                />
              ))}

              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const dayRecords = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                const isWeekendDay = isWeekend(day)
                const incomeCount = dayRecords.filter(
                  (r) => r.type === 'payment' && (r as PaymentRecord).direction === 'income'
                ).length
                const expenseCount = dayRecords.filter(
                  (r) => r.type === 'payment' && (r as PaymentRecord).direction === 'expense'
                ).length
                const reminderCount = dayRecords.filter(
                  (r) => r.type === 'simple'
                ).length

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'group relative rounded-xl p-2 text-left transition-all duration-200 ease-out min-h-[80px] sm:min-h-[100px] sm:p-2.5',
                      'bg-background hover:bg-accent/50 hover:shadow-sm',
                      isCurrentDay && 'ring-2 ring-primary/30 bg-primary/5',
                      isWeekendDay && !isCurrentDay && 'bg-muted/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
                    )}
                  >
                    <div className='flex items-start justify-between'>
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] transition-all duration-200',
                          isCurrentDay
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25'
                            : isWeekendDay
                              ? 'font-medium text-rose-600/75 dark:text-rose-400/65'
                              : 'font-medium text-foreground/70 group-hover:text-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayRecords.length > 0 && (
                        <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary/10 px-1 text-[9px] font-bold text-primary tabular-nums leading-none'>
                          {dayRecords.length}
                        </span>
                      )}
                    </div>

                    {dayRecords.length > 0 && (
                      <div className='mt-1.5 flex flex-wrap gap-[3px]'>
                        {incomeCount > 0 && (
                          <span className='inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-[2px] text-[9px] font-semibold leading-none text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20'>
                            +{incomeCount}
                          </span>
                        )}
                        {expenseCount > 0 && (
                          <span className='inline-flex items-center rounded-full bg-rose-500/15 px-1.5 py-[2px] text-[9px] font-semibold leading-none text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/20'>
                            -{expenseCount}
                          </span>
                        )}
                        {reminderCount > 0 && (
                          <span className='inline-flex items-center rounded-full bg-blue-500/15 px-1.5 py-[2px] text-[9px] font-semibold leading-none text-blue-700 dark:text-blue-400 ring-1 ring-blue-500/20'>
                            {reminderCount}
                          </span>
                        )}
                      </div>
                    )}

                    {dayRecords.length > 0 && (
                      <div className='absolute bottom-1.5 left-2 right-2 flex gap-[2px] sm:bottom-2'>
                        {dayRecords.slice(0, 5).map((record, idx) => (
                          <span
                            key={`${record.id}-${idx}`}
                            className={cn(
                              'h-[3px] flex-1 rounded-full transition-all duration-200 group-hover:h-[4px]',
                              getRecordDotColor(record)
                            )}
                          />
                        ))}
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
