import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Bell, Clock, Target , CalendarDays } from 'lucide-react'
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

export function CalendarView24() {
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
  const monthProgress = useMemo(() => { const ms = startOfMonth(currentDate); const today = new Date(); return today >= ms && today <= endOfMonth(currentDate) ? (today.getDate() / days.length) * 100 : today > endOfMonth(currentDate) ? 100 : 0 }, [currentDate, days])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }
  function handleDaySelect(date: Date) { setSelectedDate(date) }

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 24 · 进度月历</h1>
            <p className='mt-1 text-sm text-muted-foreground'>月历内嵌收支进度条 + 预算消耗追踪</p>
          </div>
        </div>
        {recordsQuery.isLoading ? (
          <div className='space-y-4'><div className='h-10 animate-pulse rounded-xl bg-muted/30' /><div className='h-64 animate-pulse rounded-xl bg-muted/30' /><div className='h-32 animate-pulse rounded-xl bg-muted/30' /></div>
        ) : (
          <>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'><Target className='h-4 w-4 text-primary' /></div>
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
            <div className='mb-4 rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
              <div className='grid grid-cols-7 gap-1'>
                {WEEK_DAYS.map((day, idx) => <div key={day} className={cn('py-1 text-center text-[10px] font-semibold', idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60')}>{day}</div>)}
              </div>
              <div className='grid grid-cols-7 gap-1'>
                {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} className='h-12' />)}
                {days.map((day) => {
                  const dateKey = fmt(day, 'yyyy-MM-dd')
                  const dayRecs = recordsByDate.get(dateKey) || []
                  const isCurrentDay = isToday(day)
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                  const dayExpense = dayRecs.reduce((s, r) => r.type === 'payment' && (r as PaymentRecord).direction === 'expense' ? s + (r as PaymentRecord).amount : s, 0)
                  const expenseRatio = summary.expense > 0 ? (dayExpense / summary.expense) * 100 : 0
                  return (
                    <button key={dateKey} onClick={() => handleDaySelect(day)} className={cn('flex h-12 flex-col items-center justify-between rounded-lg p-1 transition-all', isSelected ? 'bg-primary/10 ring-2 ring-primary shadow-sm' : isCurrentDay ? 'bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-accent/30')}>
                      <span className={cn('text-[11px] font-medium', isSelected ? 'text-primary font-bold' : isCurrentDay ? 'text-primary' : isWeekend(day) ? 'text-rose-600/60' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                      {dayRecs.length > 0 ? (
                        <div className='w-full'><div className='h-1 w-full rounded-full bg-muted/30'><div className='h-1 rounded-full bg-rose-500 transition-all' style={{ width: `${Math.min(expenseRatio * 3, 100)}%` }} /></div></div>
                      ) : <div className='h-1 w-full' />}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className='mb-4 rounded-xl border border-border/40 bg-card p-4 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold'>月份进度</span>
                <span className='text-[10px] text-muted-foreground'>{monthProgress.toFixed(0)}%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-muted/30'><div className='h-2 rounded-full bg-primary transition-all' style={{ width: `${monthProgress}%` }} /></div>
              <div className='mt-2 grid grid-cols-3 gap-2'>
                <div className='flex items-center gap-1.5'><TrendingUp className='h-3 w-3 text-emerald-600 dark:text-emerald-400' /><div><p className='text-[8px] text-muted-foreground'>收入</p><p className='text-[11px] font-semibold text-emerald-700 dark:text-emerald-400'>{formatAmount(summary.income, 'CNY')}</p></div></div>
                <div className='flex items-center gap-1.5'><TrendingDown className='h-3 w-3 text-rose-600 dark:text-rose-400' /><div><p className='text-[8px] text-muted-foreground'>支出</p><p className='text-[11px] font-semibold text-rose-700 dark:text-rose-400'>{formatAmount(summary.expense, 'CNY')}</p></div></div>
                <div className='flex items-center gap-1.5'><Wallet className='h-3 w-3 text-primary' /><div><p className='text-[8px] text-muted-foreground'>结余</p><p className={cn('text-[11px] font-semibold', summary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>{summary.balance >= 0 ? '+' : ''}{formatAmount(Math.abs(summary.balance), 'CNY')}</p></div></div>
              </div>
            </div>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-sm font-semibold'>{selectedDate ? `${fmt(selectedDate, 'M月d日', { locale: zhCN })} 日程` : '选择日期'}</h3>
              {monthRecordList.length > 0 && <Badge variant='secondary' className='text-[10px]'>{monthRecordList.length} 条日程</Badge>}
            </div>
            {selectedDate && selectedDayRecords.length > 0 ? (
              <div className='space-y-2'>
                {selectedDayRecords.map((record) => {
                  const colors = getRecordColorClasses(record)
                  const payment = record.type === 'payment' ? (record as PaymentRecord) : null
                  return (
                    <button key={record.id} onClick={() => handleDayClick(selectedDate)} className={cn('flex w-full items-center gap-3 rounded-xl border-l-4 bg-card px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md', colors.ring)}>
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', colors.bg)}>
                        {payment?.direction === 'income' ? <TrendingUp className={cn('h-4 w-4', colors.text)} /> : payment?.direction === 'expense' ? <TrendingDown className={cn('h-4 w-4', colors.text)} /> : <Bell className={cn('h-4 w-4', colors.text)} />}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'><span className='truncate text-sm font-medium'>{record.name}</span><Badge variant='outline' className={cn('shrink-0 text-[9px]', colors.bg, colors.text)}>{payment?.direction === 'income' ? '收入' : payment?.direction === 'expense' ? '支出' : '提醒'}</Badge></div>
                        {payment && <p className={cn('mt-0.5 text-xs font-semibold', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}</p>}
                      </div>
                      <Clock className='h-3.5 w-3.5 shrink-0 text-muted-foreground/40' />
                    </button>
                  )
                })}
              </div>
            ) : selectedDate ? (
              <div className='rounded-xl border border-dashed border-border/40 py-10 text-center'><Target className='mx-auto mb-2 h-8 w-8 text-muted-foreground/30' /><p className='text-sm text-muted-foreground'>当天暂无记录</p></div>
            ) : null}
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
