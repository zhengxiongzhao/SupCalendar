import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, endOfWeek, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'
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
import { buildRecordsByDateMap, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import type { PaymentRecord } from '../../types'

const WEEK_DAY_SHORT = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView13() {
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

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    return eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 })
  }, [currentDate])

  const weekData = useMemo(() => {
    return weeks.map((weekStart) => {
      const wkEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: wkEnd })
      return daysInWeek.map((day) => {
        const dateKey = fmt(day, 'yyyy-MM-dd')
        const dayRecords = recordsByDate.get(dateKey) || []
        return { date: day, dateKey, records: dayRecords }
      })
    })
  }, [weeks, recordsByDate])

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsByDate])

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 13 · 泳道视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              按周分行展示日程泳道
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

        {recordsQuery.isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-24 animate-pulse rounded-xl bg-muted/20' />
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            {/* Day header row */}
            <div className='grid grid-cols-7 gap-2'>
              {WEEK_DAY_SHORT.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    'py-2 text-center text-[10px] font-bold tracking-widest uppercase',
                    idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/50'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Week swimlanes */}
            {weekData.map((weekDays, weekIdx) => (
              <div key={weekIdx} className='rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden'>
                <div className='grid grid-cols-7 gap-px'>
                  {weekDays.map(({ date, dateKey, records }) => {
                    const isCurrentDay = isToday(date)
                    const isCurrentMonth = date.getMonth() === month
                    const hasRecords = records.length > 0

                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDayClick(date)}
                        className={cn(
                          'relative flex flex-col items-center p-2 transition-colors min-h-[72px]',
                          isCurrentDay && 'bg-primary/10',
                          !isCurrentDay && hasRecords && 'bg-accent/10',
                          !isCurrentMonth && 'opacity-30',
                          'hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <span className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium',
                          isCurrentDay
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'text-foreground/60'
                        )}>
                          {fmt(date, 'd')}
                        </span>

                        {/* Record swimlane dots */}
                        {records.length > 0 && (
                          <div className='mt-1 w-full space-y-0.5'>
                            {records.slice(0, 3).map((record, rIdx) => {
                              const colors = getRecordColorClasses(record)
                              const isPayment = record.type === 'payment'
                              const payment = isPayment ? (record as PaymentRecord) : null

                              return (
                                <div
                                  key={`${record.id}-${rIdx}`}
                                  className={cn(
                                    'flex items-center gap-1 rounded px-1 py-px text-[8px] truncate',
                                    colors.bg
                                  )}
                                >
                                  {payment?.direction === 'income' ? (
                                    <ArrowUpRight className='h-2 w-2 shrink-0 text-emerald-600 dark:text-emerald-400' />
                                  ) : payment?.direction === 'expense' ? (
                                    <ArrowDownLeft className='h-2 w-2 shrink-0 text-rose-600 dark:text-rose-400' />
                                  ) : (
                                    <Clock className='h-2 w-2 shrink-0 text-blue-600 dark:text-blue-400' />
                                  )}
                                  <span className={cn('truncate', colors.text)}>{record.name}</span>
                                </div>
                              )
                            })}
                            {records.length > 3 && (
                              <span className='text-[8px] text-muted-foreground/50'>+{records.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
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
