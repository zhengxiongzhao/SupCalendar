import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
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

export function CalendarView17() {
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

  const allMonthRecords = useMemo(() => {
    const all: CalendarRecord[] = []
    recordsByDate.forEach((records) => all.push(...records))
    return all
  }, [recordsByDate])

  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])

  const { days, firstDayOffset } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const offset = getDay(monthStart)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])

  const donutData = useMemo(() => {
    let income = 0
    let expense = 0
    for (const r of allMonthRecords) {
      if (r.type === 'payment') {
        const p = r as PaymentRecord
        if (p.direction === 'income') income += p.amount
        else expense += p.amount
      }
    }
    const total = income + expense
    if (total === 0) return { incomePct: 0, expensePct: 0, income, expense }
    return {
      incomePct: (income / total) * 100,
      expensePct: (expense / total) * 100,
      income,
      expense,
    }
  }, [allMonthRecords])

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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 17 · 径向日历</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              环形进度 + 月历网格 + 收支概览
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
          <div className='h-64 animate-pulse rounded-2xl bg-muted/20' />
        ) : (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
            <div className='lg:col-span-3'>
              <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
                <div className='grid grid-cols-7 gap-px bg-muted/30 px-3 pt-3 pb-1'>
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'py-2 text-center text-[10px] font-semibold tracking-wider',
                        idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1 p-3'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square rounded-lg bg-muted/5' />
                  ))}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecords = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const hasRecords = dayRecords.length > 0
                    const recordCount = dayRecords.length

                    let ringPct = 0
                    if (recordCount > 0) {
                      ringPct = Math.min(recordCount * 25, 100)
                    }

                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'group relative flex aspect-square items-center justify-center rounded-lg transition-all duration-200',
                          isCurrentDay && 'bg-primary/10',
                          !isCurrentDay && hasRecords && 'bg-accent/20',
                          !isCurrentDay && !hasRecords && 'hover:bg-accent/20',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <svg className='absolute inset-0 h-full w-full' viewBox='0 0 40 40'>
                          <circle
                            cx='20' cy='20' r='17'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            className='text-muted/20'
                          />
                          {hasRecords && (
                            <circle
                              cx='20' cy='20' r='17'
                              fill='none'
                              strokeWidth='2'
                              strokeLinecap='round'
                              className={isCurrentDay ? 'text-primary' : 'text-primary/50'}
                              strokeDasharray={`${(ringPct / 100) * 2 * Math.PI * 17} ${2 * Math.PI * 17}`}
                              transform='rotate(-90 20 20)'
                            />
                          )}
                        </svg>
                        <span className={cn(
                          'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                          isCurrentDay
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'text-foreground/70'
                        )}>
                          {fmt(day, 'd')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
                <div className='flex items-center justify-center mb-3'>
                  <svg className='h-28 w-28' viewBox='0 0 120 120'>
                    <circle cx='60' cy='60' r='48' fill='none' strokeWidth='10' className='stroke-muted/30' />
                    <circle
                      cx='60' cy='60' r='48' fill='none' strokeWidth='10' strokeLinecap='round'
                      className='stroke-emerald-500'
                      strokeDasharray={`${(donutData.incomePct / 100) * 2 * Math.PI * 48} ${2 * Math.PI * 48}`}
                      transform='rotate(-90 60 60)'
                    />
                    <circle
                      cx='60' cy='60' r='48' fill='none' strokeWidth='10' strokeLinecap='round'
                      className='stroke-rose-500'
                      strokeDasharray={`${(donutData.expensePct / 100) * 2 * Math.PI * 48} ${2 * Math.PI * 48}`}
                      strokeDashoffset={`-${(donutData.incomePct / 100) * 2 * Math.PI * 48}`}
                      transform='rotate(-90 60 60)'
                    />
                    <text x='60' y='56' textAnchor='middle' className='fill-foreground text-[11px] font-bold'>
                      {formatAmount(Math.abs(summary.balance), 'CNY')}
                    </text>
                    <text x='60' y='70' textAnchor='middle' className='fill-muted-foreground text-[8px]'>
                      结余
                    </text>
                  </svg>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='h-2 w-2 rounded-full bg-emerald-500' />
                      <span className='text-[10px] text-muted-foreground'>收入</span>
                    </div>
                    <span className='text-[10px] font-semibold text-emerald-700 dark:text-emerald-400'>{formatAmount(donutData.income, 'CNY')}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='h-2 w-2 rounded-full bg-rose-500' />
                      <span className='text-[10px] text-muted-foreground'>支出</span>
                    </div>
                    <span className='text-[10px] font-semibold text-rose-700 dark:text-rose-400'>{formatAmount(donutData.expense, 'CNY')}</span>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
                <h3 className='text-xs font-semibold mb-2'>总记录</h3>
                <p className='text-2xl font-bold text-foreground/80'>{allMonthRecords.length}</p>
                <p className='text-[10px] text-muted-foreground/60'>本月日程总数</p>
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
