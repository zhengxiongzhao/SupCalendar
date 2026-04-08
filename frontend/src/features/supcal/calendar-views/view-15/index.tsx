import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Clock , TrendingUp , TrendingDown } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, endOfWeek, eachWeekOfInterval , isSameDay } from 'date-fns'
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
import { buildRecordsByDateMap, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

export function CalendarView15() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])

  const monthRecordList = useMemo(() => {
    const result: { date: Date; record: CalendarRecord }[] = []
    recordsByDate.forEach((recs, key) => {
      const d = new Date(key)
      recs.forEach((r) => result.push({ date: d, record: r }))
    })
    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [recordsByDate])

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])

  const weeks = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    return eachWeekOfInterval({ start: ms, end: me }, { weekStartsOn: 0 })
  }, [currentDate])

  const weekData = useMemo(() => {
    return weeks.map((weekStart) => {
      const wkEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: wkEnd })
      const weekRecords: CalendarRecord[] = []
      for (const d of daysInWeek) {
        const key = fmt(d, 'yyyy-MM-dd')
        const recs = recordsByDate.get(key) || []
        weekRecords.push(...recs)
      }
      return { weekStart, days: daysInWeek, records: weekRecords }
    })
  }, [weeks, recordsByDate])

  function handleDaySelect(date: Date) { setSelectedDate(date) }
  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }

  const cx = 160, cy = 160, baseR = 40
  const ringGap = 30

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 15 · 轨道视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>同心圆轨道 + 周次环</p>
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

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='flex items-center justify-center rounded-2xl border border-border/40 bg-card p-6 shadow-sm'>
            <svg viewBox='0 0 320 320' className='w-full max-w-[320px]'>
              {weekData.map((_, idx) => (
                <circle key={idx} cx={cx} cy={cy} r={baseR + idx * ringGap} fill='none' stroke='currentColor' className='text-border/30' strokeWidth='1.5' />
              ))}
              <text x={cx} y={cy} textAnchor='middle' dominantBaseline='central' className='fill-foreground/80 text-[11px] font-bold'>
                {fmt(currentDate, 'M月')}
              </text>
              {weekData.map((week, wIdx) => {
                const r = baseR + wIdx * ringGap
                return week.days.map((day, dIdx) => {
                  const angle = (dIdx / 7) * 2 * Math.PI - Math.PI / 2
                  const dx = cx + r * Math.cos(angle)
                  const dy = cy + r * Math.sin(angle)
                  const dateKey = fmt(day, 'yyyy-MM-dd')
                  const recs = recordsByDate.get(dateKey) || []
                  const isCurrent = isToday(day)
                  const inMonth = day.getMonth() === month
                  const dotR = recs.length > 0 ? 5 + recs.length * 1.5 : 3
                  return (
                    <g key={`${wIdx}-${dIdx}`}>
                      <circle cx={dx} cy={dy} r={dotR} fill={isCurrent ? 'hsl(var(--primary))' : recs.length > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'} opacity={inMonth ? 1 : 0.3} className='cursor-pointer' onClick={() => handleDayClick(day)} />
                      {recs.length > 0 && inMonth && (
                        <text x={dx} y={dy + 12} textAnchor='middle' className='fill-foreground/50 text-[7px]'>{fmt(day, 'd')}</text>
                      )}
                    </g>
                  )
                })
              })}
            </svg>
          </div>
          <div className='space-y-2'>
            {weekData.map((week, wIdx) => (
              <div key={wIdx} className='rounded-xl border border-border/30 bg-card p-3 shadow-sm'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs font-semibold text-muted-foreground'>第 {wIdx + 1} 周 · {fmt(week.weekStart, 'M/d')}</span>
                  <span className='text-[10px] text-muted-foreground/50'>{week.records.length} 条</span>
                </div>
                <div className='flex flex-wrap gap-1'>
                  {week.days.filter(d => d.getMonth() === month).map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const recs = recordsByDate.get(dateKey) || []
                    return (
                      <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-medium transition-colors', isToday(day) ? 'bg-primary text-primary-foreground' : recs.length > 0 ? 'bg-accent/40 text-foreground/70' : 'text-muted-foreground/40 hover:bg-accent/20')}>
                        {fmt(day, 'd')}
                      </button>
                    )
                  })}
                </div>
                {week.records.length > 0 && (
                  <div className='mt-2 space-y-1'>
                    {week.records.slice(0, 3).map((r) => {
                      const colors = getRecordColorClasses(r)
                      const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                      return (
                        <div key={r.id} className='flex items-center gap-1.5 text-[10px]'>
                          {payment?.direction === 'income' ? <TrendingUp className='h-3 w-3 text-emerald-500' /> : payment?.direction === 'expense' ? <TrendingDown className='h-3 w-3 text-rose-500' /> : <Clock className='h-3 w-3 text-blue-500' />}
                          <span className={cn('truncate', colors.text)}>{r.name}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      
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
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
