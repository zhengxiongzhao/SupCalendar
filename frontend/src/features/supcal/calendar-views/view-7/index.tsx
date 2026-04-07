import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet, TrendingUp, TrendingDown, PieChart } from 'lucide-react'
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

function DonutChart({ income, expense, size = 140, strokeWidth = 14 }: {
  income: number
  expense: number
  size?: number
  strokeWidth?: number
}) {
  const total = income + expense
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  if (total === 0) {
    return (
      <svg width={size} height={size} className='mx-auto'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          className='text-muted/30'
        />
        <text x={size / 2} y={size / 2} textAnchor='middle' dominantBaseline='central' className='fill-muted-foreground text-xs font-medium'>
          暂无数据
        </text>
      </svg>
    )
  }

  const incomePercent = income / total
  const expensePercent = expense / total
  const incomeDash = circumference * incomePercent
  const expenseDash = circumference * expensePercent
  const incomeOffset = 0
  const expenseOffset = -incomeDash

  return (
    <svg width={size} height={size} className='mx-auto -rotate-90'>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        className='text-muted/10'
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        strokeWidth={strokeWidth}
        strokeDasharray={`${incomeDash} ${circumference - incomeDash}`}
        strokeDashoffset={incomeOffset}
        strokeLinecap='round'
        className='stroke-emerald-500'
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        strokeWidth={strokeWidth}
        strokeDasharray={`${expenseDash} ${circumference - expenseDash}`}
        strokeDashoffset={expenseOffset}
        strokeLinecap='round'
        className='stroke-rose-500'
      />
    </svg>
  )
}

function SmallRing({ value, maxValue, color, size = 64, strokeWidth = 6 }: {
  value: number
  maxValue: number
  color: string
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percent = maxValue > 0 ? Math.min(value / maxValue, 1) : 0
  const dash = circumference * percent

  return (
    <svg width={size} height={size} className='-rotate-90'>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        className='text-muted/20'
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap='round'
        className={color}
      />
    </svg>
  )
}

export function CalendarView7() {
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

  const recordStats = useMemo(() => {
    let incomeCount = 0
    let expenseCount = 0
    let reminderCount = 0
    recordsByDate.forEach((records) => {
      for (const r of records) {
        if (r.type === 'payment') {
          const p = r as PaymentRecord
          if (p.direction === 'income') incomeCount++
          else expenseCount++
        } else {
          reminderCount++
        }
      }
    })
    return { incomeCount, expenseCount, reminderCount, total: incomeCount + expenseCount + reminderCount }
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 7 · 环形统计</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              环形图 + 月历网格的可视化统计视图
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

        {recordsQuery.isLoading ? (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            <div className='h-64 animate-pulse rounded-2xl bg-muted/30' />
            <div className='h-64 animate-pulse rounded-2xl bg-muted/30 lg:col-span-2' />
          </div>
        ) : (
          <>
            <div className='mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3'>
              <div className='flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card p-6 shadow-sm'>
                <div className='relative'>
                  <DonutChart income={monthSummary.income} expense={monthSummary.expense} />
                  <div className='absolute inset-0 flex flex-col items-center justify-center'>
                    <PieChart className='h-4 w-4 text-muted-foreground' />
                    <span className={cn(
                      'mt-0.5 text-sm font-bold',
                      monthSummary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    )}>
                      {monthSummary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(monthSummary.balance), 'CNY')}
                    </span>
                  </div>
                </div>
                <div className='mt-4 flex gap-4 text-xs'>
                  <div className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                    <span className='text-muted-foreground'>收入 {formatAmount(monthSummary.income, 'CNY')}</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-rose-500' />
                    <span className='text-muted-foreground'>支出 {formatAmount(monthSummary.expense, 'CNY')}</span>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm lg:col-span-2'>
                <div className='mb-2 grid grid-cols-7 gap-1'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'py-1.5 text-center text-[10px] font-semibold tracking-wider',
                        idx === 0 || idx === 6 ? 'text-rose-500/60 dark:text-rose-400/50' : 'text-muted-foreground/60'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square rounded-lg bg-muted/5' />
                  ))}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecords = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const isWeekendDay = isWeekend(day)
                    const hasIncome = dayRecords.some((r) => r.type === 'payment' && (r as PaymentRecord).direction === 'income')
                    const hasExpense = dayRecords.some((r) => r.type === 'payment' && (r as PaymentRecord).direction === 'expense')
                    const hasReminder = dayRecords.some((r) => r.type === 'simple')

                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'group relative flex aspect-square flex-col items-center justify-center rounded-lg transition-all duration-200',
                          isCurrentDay
                            ? 'bg-primary/10 ring-2 ring-primary/30'
                            : isWeekendDay
                              ? 'bg-rose-500/5 hover:bg-rose-500/10'
                              : 'hover:bg-accent/40',
                          dayRecords.length > 0 && !isCurrentDay && 'bg-accent/20',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <span className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                          isCurrentDay
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : isWeekendDay
                              ? 'text-rose-600/70 dark:text-rose-400/60'
                              : 'text-foreground/70'
                        )}>
                          {format(day, 'd')}
                        </span>
                        {dayRecords.length > 0 && (
                          <div className='mt-0.5 flex gap-0.5'>
                            {hasIncome && <span className='h-1 w-1 rounded-full bg-emerald-500' />}
                            {hasExpense && <span className='h-1 w-1 rounded-full bg-rose-500' />}
                            {hasReminder && <span className='h-1 w-1 rounded-full bg-blue-500' />}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-3'>
              <div className='flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4'>
                <SmallRing value={monthSummary.income} maxValue={monthSummary.income + monthSummary.expense} color='stroke-emerald-500' />
                <div>
                  <div className='flex items-center gap-1.5'>
                    <TrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    <span className='text-[10px] font-medium text-muted-foreground'>收入</span>
                  </div>
                  <p className='text-sm font-bold text-emerald-700 dark:text-emerald-400'>{formatAmount(monthSummary.income, 'CNY')}</p>
                  <p className='text-[10px] text-muted-foreground'>{recordStats.incomeCount} 笔</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4'>
                <SmallRing value={monthSummary.expense} maxValue={monthSummary.income + monthSummary.expense} color='stroke-rose-500' />
                <div>
                  <div className='flex items-center gap-1.5'>
                    <TrendingDown className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
                    <span className='text-[10px] font-medium text-muted-foreground'>支出</span>
                  </div>
                  <p className='text-sm font-bold text-rose-700 dark:text-rose-400'>{formatAmount(monthSummary.expense, 'CNY')}</p>
                  <p className='text-[10px] text-muted-foreground'>{recordStats.expenseCount} 笔</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4'>
                <SmallRing value={recordStats.reminderCount} maxValue={recordStats.total || 1} color='stroke-blue-500' />
                <div>
                  <div className='flex items-center gap-1.5'>
                    <Wallet className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                    <span className='text-[10px] font-medium text-muted-foreground'>提醒</span>
                  </div>
                  <p className='text-sm font-bold text-blue-700 dark:text-blue-400'>{recordStats.reminderCount} 条</p>
                  <p className='text-[10px] text-muted-foreground'>共 {recordStats.total} 条记录</p>
                </div>
              </div>
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
