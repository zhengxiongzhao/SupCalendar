import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock, Radio } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from 'date-fns'
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

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }, [currentDate])

  const activityFeed = useMemo(() => {
    if (!recordsQuery.data) return []
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const items: { record: CalendarRecord; date: Date; daysFromNow: number }[] = []
    const seen = new Set<string>()

    for (const record of recordsQuery.data) {
      const occurrences = getOccurrencesInMonth(record, year, month)
      for (const occ of occurrences) {
        const key = `${record.id}-${fmt(occ, 'yyyy-MM-dd')}`
        if (!seen.has(key)) {
          seen.add(key)
          items.push({ record, date: occ, daysFromNow: differenceInDays(occ, now) })
        }
      }
    }
    items.sort((a, b) => a.date.getTime() - b.date.getTime())
    return items
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 13 · 脉冲活动</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              日历条 + 实时活动流
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

        {recordsQuery.isLoading ? (
          <div className='space-y-4'>
            <div className='h-16 animate-pulse rounded-xl bg-muted/20' />
            <div className='h-64 animate-pulse rounded-xl bg-muted/20' />
          </div>
        ) : (
          <>
            <div className='mb-4 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
              <div className='flex overflow-x-auto px-3 py-3 gap-1'>
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
                        'flex shrink-0 flex-col items-center justify-center rounded-xl px-2.5 py-2 transition-all duration-200 min-w-[44px]',
                        isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30',
                        !isCurrentDay && hasRecords && 'bg-accent/30',
                        !isCurrentDay && !hasRecords && 'hover:bg-accent/20',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      )}
                    >
                      <span className={cn(
                        'text-[9px] font-medium mb-1',
                        isCurrentDay ? 'text-primary' : 'text-muted-foreground/60'
                      )}>
                        {fmt(day, 'EEE', { locale: zhCN })}
                      </span>
                      <span className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                        isCurrentDay ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground/70'
                      )}>
                        {fmt(day, 'd')}
                      </span>
                      {hasRecords && (
                        <div className='mt-1 flex gap-0.5'>
                          {dayRecords.slice(0, 3).map((r, idx) => (
                            <span key={idx} className={cn(
                              'h-1 w-1 rounded-full',
                              r.type === 'payment' && (r as PaymentRecord).direction === 'income' ? 'bg-emerald-500' :
                              r.type === 'payment' ? 'bg-rose-500' : 'bg-blue-500'
                            )} />
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
                  <Radio className='h-4 w-4 text-primary' />
                  <h3 className='text-sm font-semibold'>活动流</h3>
                </div>
                <Badge variant='secondary' className='text-[10px]'>
                  {activityFeed.length} 条
                </Badge>
              </div>

              {activityFeed.length === 0 ? (
                <div className='flex h-32 items-center justify-center text-sm text-muted-foreground/50'>
                  本月暂无活动
                </div>
              ) : (
                <div className='max-h-[450px] overflow-y-auto'>
                  {activityFeed.map((item, idx) => {
                    const colors = getRecordColorClasses(item.record)
                    const isPayment = item.record.type === 'payment'
                    const payment = isPayment ? (item.record as PaymentRecord) : null
                    const isCurrentDay = isToday(item.date)

                    return (
                      <div
                        key={`${item.record.id}-${idx}`}
                        className={cn(
                          'flex items-center gap-3 border-b border-border/10 px-4 py-3 transition-colors hover:bg-accent/20 cursor-pointer',
                          isCurrentDay && 'bg-primary/5'
                        )}
                        onClick={() => handleDayClick(item.date)}
                      >
                        <div className='flex flex-col items-center shrink-0 w-12'>
                          <span className={cn(
                            'text-[10px] font-medium',
                            isCurrentDay ? 'text-primary' : 'text-muted-foreground/60'
                          )}>
                            {fmt(item.date, 'EEE', { locale: zhCN })}
                          </span>
                          <span className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                            isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground/70'
                          )}>
                            {fmt(item.date, 'd')}
                          </span>
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            {payment?.direction === 'income' ? (
                              <ArrowUpRight className='h-3.5 w-3.5 shrink-0 text-emerald-500' />
                            ) : payment?.direction === 'expense' ? (
                              <ArrowDownLeft className='h-3.5 w-3.5 shrink-0 text-rose-500' />
                            ) : (
                              <Clock className='h-3.5 w-3.5 shrink-0 text-blue-500' />
                            )}
                            <span className='text-sm font-medium text-foreground/80 truncate'>{item.record.name}</span>
                          </div>
                          <div className='flex items-center gap-2 mt-0.5'>
                            <Badge variant='outline' className={cn('px-1 text-[8px]', colors.bg, colors.text)}>
                              {payment?.direction === 'income' ? '收入' : payment?.direction === 'expense' ? '支出' : '提醒'}
                            </Badge>
                            <UrgencyBadge days={item.daysFromNow} className='text-[8px] px-1 py-0' />
                          </div>
                        </div>

                        {payment && (
                          <span className={cn('shrink-0 text-xs font-semibold', colors.text)}>
                            {payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}
                          </span>
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
