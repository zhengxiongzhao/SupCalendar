import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
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

export function CalendarView30() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
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

  const monthRecordList = useMemo(() => {
    const result: { date: Date; record: CalendarRecord }[] = []
    recordsByDate.forEach((recs, key) => {
      const d = new Date(key)
      recs.forEach((r) => result.push({ date: d, record: r }))
    })
    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [recordsByDate])

  const recordsForSheet = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])
  const flatRecordList = useMemo(() => {
    const result: { date: Date; record: CalendarRecord }[] = []
    recordsByDate.forEach((recs, key) => {
      const d = new Date(key)
      recs.forEach((r) => result.push({ date: d, record: r }))
    })
    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [recordsByDate])

  function handleDaySelect(date: Date) { setSelectedDate(date) }

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 30 · 极简月历</h1>
            <p className='mt-1 text-sm text-muted-foreground'>极简风格，细边框网格 + 扁平化记录列表</p>
          </div>
        </div>
        {recordsQuery.isLoading ? (
          <div className='flex gap-6'>
            <div className='w-[300px] shrink-0 space-y-3'>
              <div className='h-8 animate-pulse rounded bg-muted/30' />
              <div className='h-64 animate-pulse rounded bg-muted/30' />
            </div>
            <div className='flex-1 space-y-3'>
              <div className='h-10 animate-pulse rounded bg-muted/30' />
              <div className='h-96 animate-pulse rounded bg-muted/30' />
            </div>
          </div>
        ) : (
          <div className='flex gap-8'>
            <div className='w-[300px] shrink-0'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-sm font-medium text-foreground/80'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
                <div className='flex items-center gap-0.5'>
                  <Button variant='ghost' size='sm' className='h-6 px-1.5 text-[10px] text-foreground/60' onClick={() => setCurrentDate(new Date())}>今日</Button>
                  <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-3 w-3' /></Button>
                  <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-3 w-3' /></Button>
                </div>
              </div>
              <div>
                <div className='mb-0.5 grid grid-cols-7'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div key={day} className={cn('py-1.5 text-center text-[10px] font-medium', idx === 0 || idx === 6 ? 'text-rose-400' : 'text-muted-foreground/40')}>{day}</div>
                  ))}
                </div>
                <div className='grid grid-cols-7 border-t border-l border-border/20'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`e-${i}`} className='h-8 border-r border-b border-border/20' />
                  ))}
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
                          'relative flex h-8 items-center justify-center border-r border-b border-border/20 text-[11px] transition-colors',
                          isSelected ? 'bg-primary text-primary-foreground font-medium' : isCurrentDay ? 'bg-primary/5 text-primary font-medium' : 'text-foreground/60 hover:bg-accent/20'
                        )}
                      >
                        {fmt(day, 'd')}
                        {hasRecords && !isSelected && <span className='absolute bottom-0.5 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-primary/60' />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className='mt-4 space-y-1.5'>
                <div className='flex items-center justify-between py-1 border-b border-border/10'>
                  <span className='text-[10px] text-muted-foreground'>收入</span>
                  <span className='text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>{formatAmount(summary.income, 'CNY')}</span>
                </div>
                <div className='flex items-center justify-between py-1 border-b border-border/10'>
                  <span className='text-[10px] text-muted-foreground'>支出</span>
                  <span className='text-[11px] font-medium text-rose-600 dark:text-rose-400'>{formatAmount(summary.expense, 'CNY')}</span>
                </div>
                <div className='flex items-center justify-between py-1'>
                  <span className='text-[10px] text-muted-foreground'>结余</span>
                  <span className={cn('text-[11px] font-medium', summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{summary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(summary.balance), 'CNY')}</span>
                </div>
              </div>
            </div>
            <div className='min-w-0 flex-1'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='h-px flex-1 bg-border/20' />
                <span className='text-xs font-medium text-muted-foreground'>{selectedDate ? fmt(selectedDate, 'M月d日 EEEE', { locale: zhCN }) : ''}</span>
                <div className='h-px flex-1 bg-border/20' />
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
              {flatRecordList.length > 0 && (
                <div className='mt-6'>
                  <div className='mb-3 flex items-center gap-2'>
                    <div className='h-px flex-1 bg-border/15' />
                    <span className='text-[10px] text-muted-foreground/40'>本月全部记录 ({flatRecordList.length})</span>
                    <div className='h-px flex-1 bg-border/15' />
                  </div>
                  <div className='divide-y divide-border/10'>
                    {flatRecordList.slice(0, 10).map(({ date, record }) => {
                      const colors = getRecordColorClasses(record)
                      const isPayment = record.type === 'payment'
                      const payment = isPayment ? (record as PaymentRecord) : null
                      return (
                        <button key={`${record.id}-${fmt(date, 'yyyy-MM-dd')}`} onClick={() => handleDaySelect(date)} className='flex w-full items-center gap-3 py-2 text-left transition-colors hover:bg-accent/10'>
                          <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)} />
                          <span className='text-[10px] text-muted-foreground/60 w-12 shrink-0'>{fmt(date, 'M/d')}</span>
                          <span className='truncate text-xs flex-1'>{record.name}</span>
                          {payment && <span className={cn('text-[10px] shrink-0', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSheet} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
