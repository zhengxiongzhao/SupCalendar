import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Bell, Clock, Grid3X3 , CalendarDays } from 'lucide-react'
import { addMonths, subMonths, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
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

export function CalendarView21() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const allMonthRecords = useMemo(() => { const all: CalendarRecord[] = []; recordsByDate.forEach((recs) => all.push(...recs)); return all }, [recordsByDate])
  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])
  const { days, firstDayOffset } = useMemo(() => { const ms = startOfMonth(currentDate); const me = endOfMonth(currentDate); return { days: eachDayOfInterval({ start: ms, end: me }), firstDayOffset: getDay(ms) } }, [currentDate])
  const selectedDayRecords = useMemo(() => { if (!selectedDate) return []; return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || [] }, [selectedDate, recordsByDate])

  const monthRecordList = useMemo(() => {
    const result: { date: Date; record: CalendarRecord }[] = []
    recordsByDate.forEach((recs, key) => {
      const d = new Date(key)
      recs.forEach((r) => result.push({ date: d, record: r }))
    })
    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [recordsByDate])

  const recordsForSheet = useMemo(() => { if (!selectedDate) return []; return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || [] }, [selectedDate, recordsByDate])

  const weekRows = useMemo(() => {
    const rows: Date[][] = []
    let currentRow: Date[] = []
    for (let i = 0; i < firstDayOffset; i++) currentRow.push(new Date(0))
    for (const day of days) { currentRow.push(day); if (currentRow.length === 7) { rows.push(currentRow); currentRow = [] } }
    if (currentRow.length > 0) { while (currentRow.length < 7) currentRow.push(new Date(0)); rows.push(currentRow) }
    return rows
  }, [days, firstDayOffset])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }
  function handleDaySelect(date: Date) { setSelectedDate(date) }

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 21 · 网格概览</h1>
            <p className='mt-1 text-sm text-muted-foreground'>按周分行的大格子月历 + 每日嵌入式日程</p>
          </div>
        </div>
        {recordsQuery.isLoading ? (
          <div className='space-y-4'><div className='h-10 animate-pulse rounded-xl bg-muted/30' /><div className='h-96 animate-pulse rounded-xl bg-muted/30' /></div>
        ) : (
          <>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'><Grid3X3 className='h-4 w-4 text-primary' /></div>
                <div>
                  <h2 className='text-sm font-semibold'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
                  <p className='text-[10px] text-muted-foreground'>收入 {formatAmount(summary.income, 'CNY')} · 支出 {formatAmount(summary.expense, 'CNY')}</p>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <Button variant='ghost' size='sm' className='h-7 px-2 text-[10px]' onClick={() => setCurrentDate(new Date())}>今天</Button>
                <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-3.5 w-3.5' /></Button>
                <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-3.5 w-3.5' /></Button>
              </div>
            </div>
            <div className='rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden'>
              <div className='grid grid-cols-7 border-b border-border/30 bg-muted/20'>
                {WEEK_DAYS.map((day, idx) => <div key={day} className={cn('py-2 text-center text-[11px] font-semibold', idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60')}>{day}</div>)}
              </div>
              {weekRows.map((week, weekIdx) => (
                <div key={weekIdx} className='grid grid-cols-7 border-b border-border/20 last:border-b-0'>
                  {week.map((day, dayIdx) => {
                    const isEmpty = day.getFullYear() === 1970
                    if (isEmpty) return <div key={dayIdx} className='min-h-[80px] bg-muted/10' />
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecs = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    return (
                      <button key={dateKey} onClick={() => handleDaySelect(day)} className={cn('min-h-[80px] border-r border-border/15 last:border-r-0 p-1.5 text-left transition-all hover:bg-accent/20', isCurrentDay && 'bg-primary/5', isSelected && 'bg-primary/10 ring-1 ring-inset ring-primary/30')}>
                        <div className='flex items-center justify-between'>
                          <span className={cn('text-[11px] font-medium', isCurrentDay ? 'text-primary font-bold' : isWeekend(day) ? 'text-rose-600/60' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                          {isCurrentDay && <Badge variant='secondary' className='text-[8px] px-1 py-0 h-4'>今</Badge>}
                        </div>
                        <div className='mt-0.5 space-y-0.5'>
                          {dayRecs.slice(0, 2).map((r) => {
                            const colors = getRecordColorClasses(r)
                            return <div key={r.id} className={cn('truncate rounded px-1 text-[9px] font-medium leading-4', colors.bg, colors.text)}>{r.name}</div>
                          })}
                          {dayRecs.length > 2 && <span className='text-[8px] text-muted-foreground'>+{dayRecs.length - 2}</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className='mt-4'>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>{selectedDate ? `${fmt(selectedDate, 'M月d日', { locale: zhCN })} 日程详情` : '选择日期查看详情'}</h3>
                {monthRecordList.length > 0 && <Badge variant='secondary' className='text-[10px]'>{monthRecordList.length} 条日程</Badge>}
              </div>
              {selectedDate && selectedDayRecords.length > 0 ? (
                <div className='space-y-2'>
                  {selectedDayRecords.map((record) => {
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
                <div className='rounded-xl border border-dashed border-border/40 py-10 text-center'>
                  <Grid3X3 className='mx-auto mb-2 h-8 w-8 text-muted-foreground/30' />
                  <p className='text-sm text-muted-foreground'>当天暂无记录</p>
                </div>
              ) : null}
            </div>
          </>
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
