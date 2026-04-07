import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, endOfWeek, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'
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
import { buildRecordsByDateMap, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

export function CalendarView15() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
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
    return eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 }).map((weekStart, idx) => {
      const wkEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: wkEnd })
      const weekRecords: { date: Date; records: CalendarRecord[] }[] = []
      let totalRecords = 0

      for (const day of daysInWeek) {
        const dateKey = fmt(day, 'yyyy-MM-dd')
        const dayRecs = recordsByDate.get(dateKey) || []
        if (day.getMonth() === month) {
          totalRecords += dayRecs.length
          weekRecords.push({ date: day, records: dayRecs })
        }
      }

      const hasToday = daysInWeek.some((d) => isToday(d))
      return { idx, weekStart, weekEnd: wkEnd, days: daysInWeek, weekRecords, totalRecords, hasToday }
    })
  }, [currentDate, recordsByDate, year, month])

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 15 · 手风琴日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              按周折叠展开的日程列表
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
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-14 animate-pulse rounded-xl bg-muted/20' />
            ))}
          </div>
        ) : (
          <div className='space-y-2'>
            {weeks.map((week) => {
              const isExpanded = expandedWeek === week.idx
              return (
                <div
                  key={week.idx}
                  className={cn(
                    'overflow-hidden rounded-xl border transition-all duration-300',
                    week.hasToday ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-card'
                  )}
                >
                  {/* Week header */}
                  <button
                    className='flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/20 transition-colors'
                    onClick={() => setExpandedWeek(isExpanded ? null : week.idx)}
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-xs font-medium text-muted-foreground'>
                        {fmt(week.weekStart, 'M/d')} - {fmt(week.weekEnd, 'M/d')}
                      </span>
                      {week.hasToday && (
                        <Badge variant='secondary' className='text-[9px] bg-primary/10 text-primary'>
                          本周
                        </Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-[9px]'>
                        {week.totalRecords} 条
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <ChevronDown className='h-4 w-4 text-muted-foreground' />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className='border-t border-border/20 px-4 py-3 space-y-3'>
                      {week.weekRecords.map(({ date, records }) => (
                        <div key={fmt(date, 'yyyy-MM-dd')}>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                              isToday(date) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                              {fmt(date, 'd')}
                            </span>
                            <span className='text-[11px] font-medium text-muted-foreground'>
                              {fmt(date, 'EEEE', { locale: zhCN })}
                            </span>
                            <button
                              onClick={() => handleDayClick(date)}
                              className='text-[10px] text-primary hover:underline'
                            >
                              查看详情
                            </button>
                          </div>
                          {records.length === 0 ? (
                            <p className='pl-8 text-[10px] text-muted-foreground/40'>暂无日程</p>
                          ) : (
                            <div className='pl-8 space-y-1.5'>
                              {records.map((record) => {
                                const colors = getRecordColorClasses(record)
                                const isPayment = record.type === 'payment'
                                const payment = isPayment ? (record as PaymentRecord) : null
                                return (
                                  <div key={record.id} className='flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/20'>
                                    {payment?.direction === 'income' ? (
                                      <ArrowUpRight className='h-3.5 w-3.5 shrink-0 text-emerald-500' />
                                    ) : payment?.direction === 'expense' ? (
                                      <ArrowDownLeft className='h-3.5 w-3.5 shrink-0 text-rose-500' />
                                    ) : (
                                      <Clock className='h-3.5 w-3.5 shrink-0 text-blue-500' />
                                    )}
                                    <span className='text-xs font-medium text-foreground/80 truncate flex-1'>{record.name}</span>
                                    <Badge variant='outline' className={cn('px-1 text-[8px]', colors.bg, colors.text)}>
                                      {payment?.direction === 'income' ? '收入' : payment?.direction === 'expense' ? '支出' : '提醒'}
                                    </Badge>
                                    {payment && (
                                      <span className={cn('text-[10px] font-semibold', colors.text)}>
                                        {payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
