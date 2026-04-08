import { useState, useMemo } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
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

export function CalendarView48() {
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
  const recordsForSheet = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])

  const monthRecordList = useMemo(() => {
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 48 · 电路板</h1>
            <p className='mt-1 text-sm text-muted-foreground'>电路板风格，连线式日程流程图</p>
          </div>
        </div>
        {recordsQuery.isLoading ? (
          <div className='flex gap-6'>
            <div className='w-[300px] shrink-0 space-y-3'>
              <div className='h-10 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-72 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-28 animate-pulse rounded-xl bg-muted/30' />
            </div>
            <div className='flex-1 space-y-3'>
              <div className='h-12 animate-pulse rounded-xl bg-muted/30' />
              <div className='h-96 animate-pulse rounded-xl bg-muted/30' />
            </div>
          </div>
        ) : (
          <div className='flex gap-6'>
            <div className='w-[300px] shrink-0 space-y-4'>
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
              <div className='flex items-baseline gap-4 mb-4 border-b-2 border-border pb-3'>
              <span className='text-3xl font-black'>{fmt(currentDate, 'M')}</span>
              <span className='text-lg text-muted-foreground'>月</span>
              <span className='ml-auto text-sm font-medium text-emerald-600 dark:text-emerald-400'>+{formatAmount(summary.income, 'CNY')}</span>
              <span className='text-sm font-medium text-rose-600 dark:text-rose-400'>-{formatAmount(summary.expense, 'CNY')}</span>
            </div>
              <div className='rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
                <div className='mb-1.5 grid grid-cols-7 gap-0'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div key={day} className={cn('py-1 text-center text-[10px] font-semibold', idx === 0 || idx === 6 ? 'text-rose-500/80' : 'text-muted-foreground/60')}>{day}</div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-0'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`e-${i}`} className='h-9' />
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
                          'relative flex h-9 w-full flex-col items-center justify-center rounded-none border text-xs transition-all',
                          isSelected ? 'bg-primary text-primary-foreground font-bold shadow-sm' : isCurrentDay ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground/70 hover:bg-accent/50'
                        )}
                      >
                        {fmt(day, 'd')}
                        {hasRecords && !isSelected && <span className='absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary' />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className='min-w-0 flex-1 space-y-4'>
              <div className='rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <CalendarDays className='h-4 w-4 text-primary' />
                    <div>
                      <h3 className='text-sm font-semibold'>{selectedDate ? fmt(selectedDate, 'yyyy年M月d日 EEEE', { locale: zhCN }) : ''}</h3>
                      <p className='text-[11px] text-muted-foreground'>电路板风格，连线式日程流程图</p>
                    </div>
                  </div>
                  {monthRecordList.length > 0 && <Badge variant='secondary' className='text-xs'>{monthRecordList.length} 条日程</Badge>}
                </div>
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
          </div>
        )}
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSheet} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
