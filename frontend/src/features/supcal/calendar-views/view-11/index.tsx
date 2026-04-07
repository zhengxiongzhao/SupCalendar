import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, differenceInDays } from 'date-fns'
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
import { buildRecordsByDateMap, getOccurrencesInMonth, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { UrgencyBadge } from '../../components/urgency-badge'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

interface TimelineEntry {
  record: CalendarRecord
  date: Date
  daysFromNow: number
}

export function CalendarView11() {
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

  const { days, firstDayOffset } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const offset = getDay(monthStart)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])

  const timelineEntries = useMemo(() => {
    if (!recordsQuery.data) return []
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const entries: TimelineEntry[] = []
    const seen = new Set<string>()

    for (const record of recordsQuery.data) {
      const occurrences = getOccurrencesInMonth(record, year, month)
      for (const occ of occurrences) {
        const key = `${record.id}-${fmt(occ, 'yyyy-MM-dd')}`
        if (!seen.has(key)) {
          seen.add(key)
          entries.push({
            record,
            date: occ,
            daysFromNow: differenceInDays(occ, now),
          })
        }
      }
    }

    entries.sort((a, b) => a.date.getTime() - b.date.getTime())
    return entries
  }, [recordsQuery.data, year, month])

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 11 · 时间轴日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              月历导航 + 垂直时间轴展示本月日程
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
            <div className='grid grid-cols-7 gap-1'>
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className='aspect-square animate-pulse rounded-lg bg-muted/30' />
              ))}
            </div>
            <div className='h-64 animate-pulse rounded-xl bg-muted/20' />
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
            {/* Calendar grid - left side */}
            <div className='lg:col-span-2'>
              <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
                <div className='grid grid-cols-7 gap-px bg-muted/30 px-2 pt-3 pb-1'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'py-1.5 text-center text-[10px] font-semibold tracking-wider',
                        idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1 p-2'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square rounded-lg bg-muted/5' />
                  ))}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecords = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const hasRecords = dayRecords.length > 0

                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'group relative flex aspect-square flex-col items-center justify-center rounded-lg transition-all duration-200',
                          isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30',
                          !isCurrentDay && hasRecords && 'bg-accent/30',
                          !isCurrentDay && !hasRecords && 'hover:bg-accent/20',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <span className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium',
                          isCurrentDay
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'text-foreground/70'
                        )}>
                          {fmt(day, 'd')}
                        </span>
                        {hasRecords && (
                          <div className='mt-0.5 h-1 w-1 rounded-full bg-primary/60' />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Timeline - right side */}
            <div className='lg:col-span-3'>
              <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
                <div className='border-b border-border/30 px-4 py-3'>
                  <h3 className='text-sm font-semibold'>本月时间轴</h3>
                  <p className='text-[10px] text-muted-foreground'>{timelineEntries.length} 条日程</p>
                </div>

                {timelineEntries.length === 0 ? (
                  <div className='flex h-40 items-center justify-center text-sm text-muted-foreground/50'>
                    本月暂无日程
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-y-auto p-4'>
                    <div className='relative'>
                      {/* Vertical line */}
                      <div className='absolute left-[15px] top-0 bottom-0 w-px bg-border/40' />

                      {timelineEntries.map((entry, idx) => {
                        const colors = getRecordColorClasses(entry.record)
                        const isPayment = entry.record.type === 'payment'
                        const payment = isPayment ? (entry.record as PaymentRecord) : null

                        return (
                          <div key={`${entry.record.id}-${idx}`} className='relative mb-4 pl-10 last:mb-0'>
                            {/* Timeline dot */}
                            <div className={cn(
                              'absolute left-[11px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-background',
                              isToday(entry.date) ? 'bg-primary' : colors.dot
                            )} />

                            <div
                              className={cn(
                                'rounded-xl border border-border/30 p-3 transition-colors hover:bg-accent/20 cursor-pointer',
                                isToday(entry.date) && 'ring-1 ring-primary/30 bg-primary/5'
                              )}
                              onClick={() => handleDayClick(entry.date)}
                            >
                              <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                  <span className='text-xs font-medium text-foreground/80'>
                                    {fmt(entry.date, 'M月d日 EEEE', { locale: zhCN })}
                                  </span>
                                  <Badge variant='outline' className={cn('px-1.5 text-[9px]', colors.bg, colors.text)}>
                                    {payment?.direction === 'income' ? '收入' : payment?.direction === 'expense' ? '支出' : '提醒'}
                                  </Badge>
                                  {isToday(entry.date) && (
                                    <Badge variant='secondary' className='text-[9px] bg-primary/10 text-primary'>
                                      今天
                                    </Badge>
                                  )}
                                </div>
                                <UrgencyBadge days={entry.daysFromNow} className='text-[9px] px-1 py-0' />
                              </div>
                              <div className='mt-1.5 flex items-center gap-2'>
                                {payment?.direction === 'income' ? (
                                  <ArrowUpRight className='h-3.5 w-3.5 text-emerald-500' />
                                ) : payment?.direction === 'expense' ? (
                                  <ArrowDownLeft className='h-3.5 w-3.5 text-rose-500' />
                                ) : (
                                  <Clock className='h-3.5 w-3.5 text-blue-500' />
                                )}
                                <span className='text-sm font-medium text-foreground/90 truncate'>
                                  {entry.record.name}
                                </span>
                              </div>
                              {payment && (
                                <p className={cn('mt-1 text-xs font-semibold', colors.text)}>
                                  {payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
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
