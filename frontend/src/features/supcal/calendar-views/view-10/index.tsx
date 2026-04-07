import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordColorClasses, getRecordDotColor, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView10() {
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
    recordsByDate.forEach((recs) => all.push(...recs))
    return all
  }, [recordsByDate])
  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])
  const { days, firstDayOffset } = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: ms, end: me })
    const offset = getDay(ms)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])
  const topRecords = useMemo(() => {
    return allMonthRecords
      .filter((r): r is PaymentRecord => r.type === 'payment')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
  }, [allMonthRecords])
  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 10 · 拼图网格</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Bento 不对称卡片 + 月历概览
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
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <div className='md:col-span-2 rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden'>
            <div className='grid grid-cols-7 gap-px bg-muted/30 px-3 pt-3 pb-1'>
              {WEEK_DAYS.map((day, idx) => (
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
                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'group relative flex aspect-square flex-col items-center justify-center rounded-lg transition-all duration-200',
                      isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30',
                      !isCurrentDay && dayRecords.length > 0 && 'bg-accent/30',
                      !isCurrentDay && dayRecords.length === 0 && 'hover:bg-accent/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    <span className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                      isCurrentDay ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground/70'
                    )}>
                      {fmt(day, 'd')}
                    </span>
                    {dayRecords.length > 0 && (
                      <div className='mt-0.5 flex gap-0.5'>
                        {dayRecords.slice(0, 3).map((record, idx) => (
                          <span key={`${record.id}-${idx}`} className={cn('h-1 w-1 rounded-full', getRecordDotColor(record))} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <div className='space-y-3'>
            <div className='rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <TrendingUp className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                <span className='text-xs font-semibold text-emerald-700 dark:text-emerald-400'>收入</span>
              </div>
              <p className='text-xl font-bold text-emerald-700 dark:text-emerald-400'>
                {formatAmount(summary.income, 'CNY')}
              </p>
            </div>
            <div className='rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <TrendingDown className='h-4 w-4 text-rose-600 dark:text-rose-400' />
                <span className='text-xs font-semibold text-rose-700 dark:text-rose-400'>支出</span>
              </div>
              <p className='text-xl font-bold text-rose-700 dark:text-rose-400'>
                {formatAmount(summary.expense, 'CNY')}
              </p>
            </div>
            <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
              <h3 className='text-xs font-semibold mb-3'>TOP 4</h3>
              {topRecords.length === 0 ? (
                <p className='text-[10px] text-muted-foreground/50'>暂无数据</p>
              ) : (
                <div className='space-y-2'>
                  {topRecords.map((record) => {
                    const colors = getRecordColorClasses(record)
                    return (
                      <div key={record.id} className='flex items-center gap-2'>
                        {record.direction === 'income' ? (
                          <ArrowUpRight className='h-3 w-3 text-emerald-500' />
                        ) : (
                          <ArrowDownLeft className='h-3 w-3 text-rose-500' />
                        )}
                        <span className='text-[11px] font-medium truncate flex-1'>{record.name}</span>
                        <span className={cn('text-[10px] font-bold', colors.text)}>
                          {record.direction === 'income' ? '+' : '-'}{formatAmount(record.amount, record.currency)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
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