import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock, Gauge } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
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
import { buildRecordsByDateMap, getFinancialSummary, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

export function CalendarView30() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const { days } = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    return { days: eachDayOfInterval({ start: ms, end: me }) }
  }, [currentDate])
  const allMonthRecords = useMemo(() => {
    const all: CalendarRecord[] = []
    recordsByDate.forEach(r => all.push(...r))
    return all
  }, [recordsByDate])
  const summary = useMemo(() => getFinancialSummary(allMonthRecords), [allMonthRecords])
  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }

  const pressureRatio = summary.income + summary.expense > 0 ? summary.expense / (summary.income + summary.expense) : 0.5
  const gaugeAngle = -90 + pressureRatio * 180

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 30 · 气压计</h1>
            <p className='mt-1 text-sm text-muted-foreground'>半圆仪表盘 + 压力日程</p>
          </div>
        </div>
        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'><CalendarDays className='h-4 w-4 text-primary' /></div>
            <h2 className='text-lg font-semibold tracking-tight'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button variant='ghost' size='sm' className='h-8 text-xs font-medium' onClick={() => setCurrentDate(new Date())}>今天</Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-4 w-4' /></Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-4 w-4' /></Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <div className='lg:col-span-2 space-y-4'>
            <div className='flex items-center justify-center rounded-2xl border border-border/40 bg-card p-6 shadow-sm'>
              <svg viewBox='0 0 200 120' className='w-64'>
                <path d='M 20 100 A 80 80 0 0 1 180 100' fill='none' stroke='hsl(var(--muted))' strokeWidth='12' strokeLinecap='round' />
                <path d='M 20 100 A 80 80 0 0 1 180 100' fill='none' stroke='url(#gaugeGrad)' strokeWidth='12' strokeLinecap='round' strokeDasharray='251.3' strokeDashoffset={251.3 * (1 - pressureRatio)} />
                <defs>
                  <linearGradient id='gaugeGrad' x1='0' y1='0' x2='1' y2='0'>
                    <stop offset='0%' stopColor='hsl(152 60% 40%)' />
                    <stop offset='100%' stopColor='hsl(0 70% 50%)' />
                  </linearGradient>
                </defs>
                <line x1='100' y1='100' x2={100 + 65 * Math.cos((gaugeAngle * Math.PI) / 180)} y2={100 + 65 * Math.sin((gaugeAngle * Math.PI) / 180)} stroke='hsl(var(--foreground))' strokeWidth='2' strokeLinecap='round' />
                <circle cx='100' cy='100' r='4' fill='hsl(var(--foreground))' />
                <text x='30' y='115' className='fill-emerald-600 dark:fill-emerald-400 text-[8px]'>收入</text>
                <text x='155' y='115' className='fill-rose-600 dark:fill-rose-400 text-[8px]'>支出</text>
              </svg>
            </div>

            <div className='flex gap-1 flex-wrap'>
              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const dayRecords = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                return (
                  <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex flex-col items-center justify-center rounded-lg transition-all min-w-[36px] py-1.5', isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30', !isCurrentDay && dayRecords.length > 0 && 'bg-accent/30', !isCurrentDay && dayRecords.length === 0 && 'hover:bg-accent/20')}>
                    <span className={cn('text-[9px] text-muted-foreground/60')}>{fmt(day, 'EEE', { locale: zhCN })}</span>
                    <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium', isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground/70')}>{fmt(day, 'd')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2 mb-2'>
              <Gauge className='h-4 w-4 text-primary' />
              <h3 className='text-sm font-semibold'>财务压力</h3>
            </div>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-emerald-600 dark:text-emerald-400'>{formatAmount(summary.income, 'CNY')}</span>
              <span className='text-rose-600 dark:text-rose-400'>{formatAmount(summary.expense, 'CNY')}</span>
            </div>
            <div className='space-y-1.5 max-h-[300px] overflow-y-auto'>
              {allMonthRecords.map((r) => {
                const colors = getRecordColorClasses(r)
                const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                const pressure = payment ? Math.min(100, (payment.amount / (summary.expense || 1)) * 50) : 0
                return (
                  <div key={r.id} className={cn('rounded-lg p-2', colors.bg)}>
                    <div className='flex items-center gap-1.5'>
                      {payment?.direction === 'income' ? <ArrowUpRight className='h-3 w-3 text-emerald-500' /> : payment?.direction === 'expense' ? <ArrowDownLeft className='h-3 w-3 text-rose-500' /> : <Clock className='h-3 w-3 text-blue-500' />}
                      <span className='text-[10px] font-medium truncate flex-1'>{r.name}</span>
                    </div>
                    {payment && (
                      <div className='mt-1 h-1 rounded-full bg-muted/50 overflow-hidden'>
                        <div className={cn('h-full rounded-full', payment.direction === 'income' ? 'bg-emerald-500' : 'bg-rose-500')} style={{ width: `${pressure}%` }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
