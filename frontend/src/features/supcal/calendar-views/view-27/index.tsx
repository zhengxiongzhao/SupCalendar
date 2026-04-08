import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown, Wallet, Bell, Clock, ChevronDown } from 'lucide-react'
import { addMonths, subMonths, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, format as dfFormat } from 'date-fns'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView27() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const recordsQuery = useRecords()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const allMonthRecords = useMemo(() => {
    const all: CalendarRecord[] = []
    recordsByDate.forEach((recs) => all.push(...recs))
    return all
  }, [recordsByDate])
  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])
  const { days, firstDayOffset } = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    return { days: eachDayOfInterval({ start: ms, end: me }), firstDayOffset: getDay(ms) }
  }, [currentDate])
  const recordsForSheet = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])
  const daysWithRecords = useMemo(() => {
    const result: { date: Date; dateKey: string; records: CalendarRecord[] }[] = []
    recordsByDate.forEach((recs, key) => {
      const d = new Date(key)
      result.push({ date: d, dateKey: key, records: recs })
    })
    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [recordsByDate])

  function handleDaySelect(date: Date) { setSelectedDate(date) }
  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }
  function toggleDayExpand(dateKey: string) {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(dateKey)) next.delete(dateKey)
      else next.add(dateKey)
      return next
    })
  }

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 27 · 手风琴日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>月历网格 + 可展开折叠的日程分组</p>
          </div>
        </div>
        {recordsQuery.isLoading ? (
          <div className='flex gap-6'>
            <div className='w-[340px] shrink-0 space-y-3'>
              <div className='h-10 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-72 animate-pulse rounded-xl bg-muted/30' />
            </div>
            <div className='flex-1 space-y-3'>
              <div className='h-12 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-96 animate-pulse rounded-xl bg-muted/30' />
            </div>
          </div>
        ) : (
          <div className='flex gap-6'>
            <div className='w-[340px] shrink-0 space-y-4'>
              <div className='flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                  <CalendarDays className='h-4 w-4 text-primary' />
                  <h2 className='text-sm font-semibold'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
                </div>
                <div className='flex items-center gap-1'>
                  <Button variant='ghost' size='sm' className='h-7 px-2 text-[10px]' onClick={() => setCurrentDate(new Date())}>今天</Button>
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-3.5 w-3.5' /></Button>
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-3.5 w-3.5' /></Button>
                </div>
              </div>
              <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
                <div className='mb-1.5 grid grid-cols-7 gap-0.5'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div key={day} className={cn('py-1 text-center text-[10px] font-semibold', idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60')}>{day}</div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-0.5'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} className='h-9' />)}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecs = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const hasRecords = dayRecs.length > 0
                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDaySelect(day)}
                        className={cn(
                          'relative flex h-9 w-full items-center justify-center rounded-md text-xs transition-all',
                          isSelected ? 'bg-primary text-primary-foreground font-bold shadow-sm' : isCurrentDay ? 'bg-primary/10 text-primary font-semibold' : isWeekend(day) ? 'text-rose-600/70 hover:bg-accent/50' : 'text-foreground/70 hover:bg-accent/50'
                        )}
                      >
                        {fmt(day, 'd')}
                        {hasRecords && !isSelected && <span className='absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary' />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2'>
                  <TrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  <div className='flex-1'><p className='text-[9px] text-muted-foreground'>收入</p><p className='text-xs font-semibold text-emerald-700 dark:text-emerald-400'>{formatAmount(summary.income, 'CNY')}</p></div>
                </div>
                <div className='flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2'>
                  <TrendingDown className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
                  <div className='flex-1'><p className='text-[9px] text-muted-foreground'>支出</p><p className='text-xs font-semibold text-rose-700 dark:text-rose-400'>{formatAmount(summary.expense, 'CNY')}</p></div>
                </div>
                <div className='flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
                  <Wallet className='h-3.5 w-3.5 text-primary' />
                  <div className='flex-1'><p className='text-[9px] text-muted-foreground'>结余</p><p className={cn('text-xs font-semibold', summary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>{summary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(summary.balance), 'CNY')}</p></div>
                </div>
              </div>
            </div>
            <div className='min-w-0 flex-1'>
              <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                  <CalendarDays className='h-4 w-4 text-primary' />
                  <h3 className='text-sm font-semibold'>日程列表</h3>
                  <span className='text-xs text-muted-foreground'>{daysWithRecords.length} 天有记录</span>
                </div>
              </div>
              <div className='space-y-2'>
                {daysWithRecords.length > 0 ? daysWithRecords.map(({ date, dateKey, records: recs }) => {
                  const isExpanded = expandedDays.has(dateKey)
                  const daySummary = getFinancialSummary(recs)
                  const isCurrentDay = isToday(date)
                  const isSel = selectedDate ? isSameDay(date, selectedDate) : false
                  return (
                    <div key={dateKey} className={cn('rounded-xl border bg-card shadow-sm transition-all', isSel ? 'border-primary/40' : 'border-border/40')}>
                      <button
                        onClick={() => { toggleDayExpand(dateKey); handleDaySelect(date) }}
                        className='flex w-full items-center gap-3 px-4 py-3 text-left'
                      >
                        <div className={cn('flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg', isCurrentDay ? 'bg-primary text-primary-foreground' : 'bg-accent/50')}>
                          <span className='text-[10px] font-medium leading-none'>{dfFormat(date, 'EEE', { locale: zhCN })}</span>
                          <span className='text-sm font-bold leading-tight'>{fmt(date, 'd')}</span>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-semibold'>{fmt(date, 'M月d日')}</span>
                            <Badge variant='secondary' className='text-[9px]'>{recs.length} 条</Badge>
                          </div>
                          <div className='mt-0.5 flex items-center gap-3 text-[10px]'>
                            {daySummary.income > 0 && <span className='text-emerald-600 dark:text-emerald-400'>+{formatAmount(daySummary.income, 'CNY')}</span>}
                            {daySummary.expense > 0 && <span className='text-rose-600 dark:text-rose-400'>-{formatAmount(daySummary.expense, 'CNY')}</span>}
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className='h-4 w-4 text-muted-foreground/50' /> : <ChevronRight className='h-4 w-4 text-muted-foreground/50' />}
                      </button>
                      {isExpanded && (
                        <div className='border-t border-border/30 px-4 py-2 space-y-2'>
                          {recs.map((record) => {
                            const colors = getRecordColorClasses(record)
                            const isPayment = record.type === 'payment'
                            const payment = isPayment ? (record as PaymentRecord) : null
                            return (
                              <button key={record.id} onClick={() => handleDayClick(date)} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-accent/30')}>
                                <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', colors.bg)}>
                                  {payment?.direction === 'income' ? <TrendingUp className={cn('h-3.5 w-3.5', colors.text)} /> : payment?.direction === 'expense' ? <TrendingDown className={cn('h-3.5 w-3.5', colors.text)} /> : <Bell className={cn('h-3.5 w-3.5', colors.text)} />}
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <span className='truncate text-xs font-medium'>{record.name}</span>
                                  {payment && <p className={cn('text-[10px] font-semibold', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}</p>}
                                </div>
                                <Clock className='h-3 w-3 shrink-0 text-muted-foreground/30' />
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }) : (
                  <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-16 text-muted-foreground'>
                    <CalendarDays className='mb-2 h-8 w-8 text-muted-foreground/30' />
                    <p className='text-sm'>本月暂无记录</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSheet} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
