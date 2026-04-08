import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown, Wallet, Bell, Clock, Filter } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
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
type FilterType = 'all' | 'income' | 'expense' | 'reminder'

export function CalendarView20() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const recordsQuery = useRecords()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const allMonthRecords = useMemo(() => { const all: CalendarRecord[] = []; recordsByDate.forEach((recs) => all.push(...recs)); return all }, [recordsByDate])
  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])
  const { days, firstDayOffset } = useMemo(() => {
    const ms = startOfMonth(currentDate); const me = endOfMonth(currentDate)
    return { days: eachDayOfInterval({ start: ms, end: me }), firstDayOffset: getDay(ms) }
  }, [currentDate])
  const selectedDayRecords = useMemo(() => { if (!selectedDate) return []; return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || [] }, [selectedDate, recordsByDate])
  const recordsForSheet = useMemo(() => { if (!selectedDate) return []; return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || [] }, [selectedDate, recordsByDate])
  const filteredRecords = useMemo(() => {
    if (filter === 'all') return selectedDayRecords
    return selectedDayRecords.filter((r) => {
      if (filter === 'income') return r.type === 'payment' && (r as PaymentRecord).direction === 'income'
      if (filter === 'expense') return r.type === 'payment' && (r as PaymentRecord).direction === 'expense'
      return r.type === 'simple'
    })
  }, [selectedDayRecords, filter])
  const monthRecordList = useMemo(() => {
    const uniqueRecords = new Map<string, CalendarRecord>()
    recordsByDate.forEach((records) => { for (const r of records) { if (!uniqueRecords.has(r.id)) uniqueRecords.set(r.id, r) } })
    return Array.from(uniqueRecords.values())
  }, [recordsByDate])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }
  function handleDaySelect(date: Date) { setSelectedDate(date) }

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: selectedDayRecords.length },
    { key: 'income', label: '收入', count: selectedDayRecords.filter(r => r.type === 'payment' && (r as PaymentRecord).direction === 'income').length },
    { key: 'expense', label: '支出', count: selectedDayRecords.filter(r => r.type === 'payment' && (r as PaymentRecord).direction === 'expense').length },
    { key: 'reminder', label: '提醒', count: selectedDayRecords.filter(r => r.type === 'simple').length },
  ]

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 20 · 标签过滤</h1>
            <p className='mt-1 text-sm text-muted-foreground'>月历 + 可过滤的日程列表，快速筛选收支提醒</p>
          </div>
        </div>
        {recordsQuery.isLoading ? (
          <div className='flex gap-6'>
            <div className='w-[320px] shrink-0 space-y-3'><div className='h-10 animate-pulse rounded-xl bg-muted/30' /><div className='h-64 animate-pulse rounded-xl bg-muted/30' /></div>
            <div className='flex-1 space-y-3'><div className='h-10 animate-pulse rounded-xl bg-muted/30' /><div className='h-64 animate-pulse rounded-xl bg-muted/30' /></div>
          </div>
        ) : (
          <div className='flex gap-6'>
            <div className='w-[320px] shrink-0 space-y-4'>
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
                  {WEEK_DAYS.map((day, idx) => <div key={day} className={cn('py-1 text-center text-[10px] font-semibold', idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60')}>{day}</div>)}
                </div>
                <div className='grid grid-cols-7 gap-0.5'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} className='h-9' />)}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecs = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    return (
                      <button key={dateKey} onClick={() => handleDaySelect(day)} className={cn('relative flex h-9 w-full items-center justify-center rounded-md text-xs transition-all', isSelected ? 'bg-primary text-primary-foreground font-bold shadow-sm' : isCurrentDay ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-accent/50')}>
                        {fmt(day, 'd')}
                        {dayRecs.length > 0 && !isSelected && <span className='absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary' />}
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
              <div className='mb-3 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                  <Filter className='h-4 w-4 text-primary' />
                  <h3 className='text-sm font-semibold'>{selectedDate ? fmt(selectedDate, 'M月d日 EEEE', { locale: zhCN }) : '请选择日期'}</h3>
                </div>
                {selectedDate && <Badge variant='secondary' className='text-[10px]'>{filteredRecords.length} 条</Badge>}
              </div>
              {selectedDate && (
                <div className='mb-3 flex items-center gap-1.5'>
                  {filters.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)} className={cn('flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all', filter === f.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60')}>
                      {f.label}
                      {f.count > 0 && <span className={cn('ml-0.5 rounded-full px-1 text-[9px]', filter === f.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground')}>{f.count}</span>}
                    </button>
                  ))}
                </div>
              )}
              {selectedDate && filteredRecords.length > 0 ? (
                <div className='space-y-2'>
                  {filteredRecords.map((record) => {
                    const colors = getRecordColorClasses(record)
                    const isPayment = record.type === 'payment'
                    const payment = isPayment ? (record as PaymentRecord) : null
                    return (
                      <button key={record.id} onClick={() => handleDayClick(selectedDate)} className={cn('flex w-full items-center gap-3 rounded-xl border-l-4 bg-card px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md', colors.ring)}>
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', colors.bg)}>
                          {payment?.direction === 'income' ? <TrendingUp className={cn('h-4 w-4', colors.text)} /> : payment?.direction === 'expense' ? <TrendingDown className={cn('h-4 w-4', colors.text)} /> : <Bell className={cn('h-4 w-4', colors.text)} />}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='truncate text-sm font-medium'>{record.name}</span>
                            <Badge variant='outline' className={cn('shrink-0 text-[9px]', colors.bg, colors.text)}>{payment?.direction === 'income' ? '收入' : payment?.direction === 'expense' ? '支出' : '提醒'}</Badge>
                          </div>
                          {payment && <p className={cn('mt-0.5 text-xs font-semibold', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}</p>}
                        </div>
                        <Clock className='h-3.5 w-3.5 shrink-0 text-muted-foreground/40' />
                      </button>
                    )
                  })}
                </div>
              ) : selectedDate ? (
                <div className='rounded-xl border border-dashed border-border/40 py-12 text-center'>
                  <Filter className='mx-auto mb-2 h-8 w-8 text-muted-foreground/30' />
                  <p className='text-sm text-muted-foreground'>{filter === 'all' ? '当天暂无记录' : `没有${filter === 'income' ? '收入' : filter === 'expense' ? '支出' : '提醒'}记录`}</p>
                </div>
              ) : null}
              <div className='mt-6'>
                <h4 className='mb-3 text-sm font-semibold text-muted-foreground'>本月全部记录</h4>
                {monthRecordList.length === 0 ? (
                  <p className='text-xs text-muted-foreground/60'>本月暂无记录</p>
                ) : (
                  <div className='space-y-1.5'>
                    {monthRecordList.map((record) => {
                      const colors = getRecordColorClasses(record)
                      const isPayment = record.type === 'payment'
                      const payment = isPayment ? (record as PaymentRecord) : null
                      return (
                        <div key={record.id} className='flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs'>
                          <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} />
                          <span className='truncate font-medium text-foreground/80'>{record.name}</span>
                          {payment && <span className={cn('ml-auto shrink-0 font-semibold', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}</span>}
                          {!isPayment && <Clock className='ml-auto h-3 w-3 text-muted-foreground' />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      
            <div className='mt-6'>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>本月日程</h3>
                {monthRecordList.length > 0 && <Badge variant='secondary' className='text-xs'>{monthRecordList.length} 条日程</Badge>}
              </div>
              {monthRecordList.length > 0 ? (
                <div className='space-y-3 max-h-[600px] overflow-y-auto pr-1'>
                  {Array.from(recordsByDate.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([dateKey, recs]) => {
                    const date = new Date(dateKey)
                    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                    return (
                      <div key={dateKey} className={cn('rounded-lg border border-border/20 p-3 transition-all', isSelected && 'bg-primary/5 ring-1 ring-primary/20')}>
                        <div className='flex items-center gap-2 mb-2'>
                          <button onClick={() => handleDaySelect(date)} className='flex items-center gap-2 hover:bg-accent/20 rounded px-1 py-0.5 transition-colors'>
                            <span className='text-xs font-semibold'>{fmt(date, 'M月d日', { locale: zhCN })}</span>
                            <span className='text-[10px] text-muted-foreground'>{fmt(date, 'EEE', { locale: zhCN })}</span>
                          </button>
                          <Badge variant='outline' className='text-[9px] h-4 px-1.5'>{recs.length}条</Badge>
                        </div>
                        <div className='space-y-1.5'>
                          {recs.map((record) => {
                            const colors = getRecordColorClasses(record)
                            const isPayment = record.type === 'payment'
                            const payment = isPayment ? (record as PaymentRecord) : null
                            return (
                              <button key={record.id} onClick={() => { setSelectedDate(date); setSheetOpen(true) }} className={cn('flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent/20')}>
                                <div className={cn('h-2 w-2 rounded-full shrink-0', colors.dot)} />
                                <span className='truncate text-xs flex-1'>{record.name}</span>
                                {payment && <span className={cn('text-[10px] shrink-0 font-semibold', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-16 text-muted-foreground'>
                  <CalendarDays className='mb-2 h-8 w-8 text-muted-foreground/30' />
                  <p className='text-sm'>本月暂无记录</p>
                </div>
              )}
            </div>
</Main>
      <DayDetailSheet date={selectedDate} records={recordsForSheet} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
